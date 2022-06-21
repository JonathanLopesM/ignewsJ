
import {FaGithub} from 'react-icons/fa';
import {FiX} from 'react-icons/fi';
import {signIn, signOut, useSession} from 'next-auth/client'

import styles from './styles.module.scss';

export function SignInButton(){
  const [session] = useSession() //se o user esta logado ou não


  return session ? (//se esta logado
          
    <button 
    type="button"
    className={styles.signInButton}
    onClick={() => signOut()}
    >
      <FaGithub color= "#04d361"/>
      {session.user.name}
      <FiX color = "#737388" className={styles.closeIcon}/>
</button>
  ) : (
        
    <button 
    type="button"
    className={styles.signInButton}
    onClick={() => signIn('github')}
    >
      <FaGithub color= "#eba417"/>
      Sign in with GitHub
</button>

  )
}