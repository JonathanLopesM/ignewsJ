import { query as q } from 'faunadb'

import NextAuth from 'next-auth'
import { session } from 'next-auth/client'
import Providers from 'next-auth/providers'

import { fauna } from '../../../services/fauna'

export default NextAuth({
  
  // Configure one or more authentication providers
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: 'read:user'
    }),
  ],
  
  callbacks: {
    async session(session) {
      try {
        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(
                q.Index('subscription_by_status'),
                "active"
              )
            ])
          )
        )

        return {
          ...session,
          activeSubscription : userActiveSubscription
        }
      } catch {
        return {
          ...session,
          activeSubscription: null,
        }
      }
    },
    async signIn(user, account, profile){
      const {email} = user
      //utilizaremos query 
      try{
            await fauna.query(
              q.If(                   //Se
                q.Not(                    //Não
                  q.Exists(                         //Existe
                    q.Match(                                    //Um Usuario pro Email
                      q.Index('user_by_email'),
                      q.Casefold(user.email)         //Que bate com esse.
                        )
                    )
                  ),
                  q.Create(   //VAMOS CRIAR
                    q.Collection('users'),    //UM USUARIO
                    {data: { email } }        //COM ESSE EMAIL
                  ),
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(user.email)
                    )
                  )
                )
              )
 
           return true
      } catch {
        return false
      }
    },
  }
})