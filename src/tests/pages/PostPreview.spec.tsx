import { render, screen } from '@testing-library/react'
import { mocked } from 'jest-mock'
import { useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import PostPreview, { getStaticProps } from '../../pages/posts/preview/[slug]'
import Post, {getServerSideProps } from '../../pages/posts/[slug]'
import { getPrismicClient } from '../../services/prismic'

jest.mock('../../services/stripe')

const postPreview = 
  { 
    slug: 'my-new-post-preview', 
    title: 'My New Post Preview', 
    content: '<p>Post excerpt</p>', 
    updatedAt: '10 de Abril'
  }

jest.mock('next-auth/client')
jest.mock('next/router')
jest.mock('../../services/prismic')

describe('Post preview page', () => {
  it('renders corrently', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([null, false])

    render(<PostPreview post={postPreview} />)

    expect(screen.getByText("My New Post Preview")).toBeInTheDocument()
    expect(screen.getByText("Post excerpt")).toBeInTheDocument()
    expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument()
  })

  it('redirects user to full post when user is subscribed', async () => {
    const useSessionMocked = mocked(useSession)
    const useRouterMocked = mocked(useRouter)
    const pushMock = jest.fn()

    useSessionMocked.mockReturnValueOnce([
      { activeSubscription: 'fake-active-subscription' },
      false
    ] as any)

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any )

    render(<PostPreview post={postPreview} />)

    expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post-preview')
  });

  it('loads initial data',async () => {

    const getPrismicClientMocked = mocked(getPrismicClient)
    
    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data : {
          title: 'My New Post Preview',
              content: [
                { type: 'paragraph', text: 'Post content' }
              ],
        },
        last_publication_date: '04-02-2022'
      })
    }as any)


    
    const response = await getStaticProps({
      params: { slug: 'my-new-post-preview'}
    })

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post-preview',
            title: 'My New Post Preview',
            content: '<p>Post content</p>',
            updatedAt: '02 de abril de 2022'
          }
        }
      })
    )
  })

})