import { render, screen, fireEvent } from '@testing-library/react'
import { mocked } from 'jest-mock'
import { signIn, useSession } from "next-auth/client"
import push, { useRouter } from 'next/router'
import { SubscribeButton } from '.'

jest.mock("next-auth/client")

jest.mock('next/router')

describe('SubscribeButton component', () => {

    it('renders correctly', () => {
      const useSessionMocked = mocked(useSession)

      useSessionMocked.mockReturnValueOnce([null, false])
      render(
        <SubscribeButton />
      )
        expect(screen.getByText('Subscribe Now')).toBeInTheDocument() //test de texto "home" vai ser encontrado
    })

    it('redirects user to signIn when not authenticated', () => {
      const signInMocked = mocked(signIn)
      const useSessionMocked = mocked(useSession)

      useSessionMocked.mockReturnValueOnce([null, false])

      render(
        <SubscribeButton/>
      )

      const subscribeButton = screen.getByText('Subscribe Now')

      fireEvent.click(subscribeButton)

      expect(signInMocked).toHaveBeenCalled()
    })

    it('redirects to posts when user already has a subscription', () => {
        const useRouterMocked = mocked(useRouter)
        const useSessionMocked = mocked(useSession)

        useSessionMocked.mockReturnValueOnce([ //mocking a user
          { 
            user: {
              name: 'John Doe', 
              email: 'john.doe@example.com'
            },
            activeSubscription: 'fake-active-subscription', 
            expires: 'fake-expires'
          },
           false
        ])

        const pushMock = jest.fn()

        useRouterMocked.mockReturnValueOnce({
          push: pushMock
        } as any)
        render(<SubscribeButton />)

        const subscribeButton = screen.getByText('Subscribe Now')

        fireEvent.click(subscribeButton)

        expect(pushMock).toHaveBeenCalledWith('/posts')
    })

})
