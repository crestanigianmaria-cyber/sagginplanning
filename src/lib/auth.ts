import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    // Office login with email + password
    CredentialsProvider({
      id: 'office-login',
      name: 'Office Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.officeUser.findUnique({
          where: { email: credentials.email },
        });
        
        if (!user || !user.isActive) return null;
        
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          userType: 'OFFICE' as const,
        };
      },
    }),
    
    // Driver login with PIN
    CredentialsProvider({
      id: 'driver-login',
      name: 'Driver Login',
      credentials: {
        driverId: { label: 'Driver', type: 'text' },
        pin: { label: 'PIN', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.driverId || !credentials?.pin) return null;
        
        const driver = await prisma.driver.findUnique({
          where: { id: credentials.driverId },
        });
        
        if (!driver || driver.status !== 'ATTIVO') return null;
        
        const isValid = await bcrypt.compare(credentials.pin, driver.pin);
        if (!isValid) return null;
        
        return {
          id: driver.id,
          name: driver.name,
          role: driver.role,
          profilePicture: driver.profilePicture || null,
          userType: 'DRIVER' as const,
        };
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.userType = (user as any).userType;
        token.profilePicture = (user as any).profilePicture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).userType = token.userType;
        (session.user as any).profilePicture = token.profilePicture;
      }
      return session;
    },
  },
  
  pages: {
    signIn: '/login',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};
