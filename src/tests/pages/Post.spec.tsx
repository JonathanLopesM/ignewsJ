import { render, screen } from '@testing-library/react'
import { mocked } from 'jest-mock'
import { getSession } from 'next-auth/client'
import Post, {getServerSideProps } from '../../pages/posts/[slug]'
import { getPrismicClient } from '../../services/prismic'

jest.mock('../../services/stripe')

const post = 
  { 
    slug: 'my-new-post', 
    title: 'My New Post', 
    content: '<p>Post excerpt</p>', 
    updatedAt: '10 de Abril'
  }

jest.mock('next-auth/client')
jest.mock('../../services/prismic')

describe('Post page', () => {
  it('renders corrently', () => {
    render(<Post post={post} />)

    expect(screen.getByText("My New Post")).toBeInTheDocument()
    expect(screen.getByText("Post excerpt")).toBeInTheDocument()
  })

  it('redirects user if no subscription is found', async () => {
    const getSessionMocked = mocked(getSession)

    getSessionMocked.mockResolvedValueOnce(null)

    const response = await getServerSideProps({
      params : { slug : 'my-new-post'}
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: `/posts/preview/${post.slug}`
        })
      })
    )
  })

  it('loads initial data',async () => {
    const getSessionMocked = mocked(getSession)

    const getPrismicClientMocked = mocked(getPrismicClient)
    
    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data : {
          title: 'My New Post',
              content: [
                { type: 'paragraph', text: 'Post content' }
              ],
        },
        last_publication_date: '04-02-2022'
      })
    }as any)

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription'      
    } as any)

    
    const response = await getServerSideProps({
      params: { slug: 'my-new-post'}
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            title: 'My New Post',
            content: '<p>Post content</p>',
            updatedAt: '02 de abril de 2022'
          }
        }
      })
    )
  })

})