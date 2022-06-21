import { render, screen } from '@testing-library/react'
import { mocked } from 'jest-mock'
import Posts, {getStaticProps } from '../../pages/posts'
import { getPrismicClient } from '../../services/prismic'

jest.mock('../../services/stripe')

const posts = [
  { 
    slug: 'my-new-post', 
    title: 'My New Post', 
    excerpt: 'Post excerpt', 
    updatedAt: 'March 10'
  }
]

jest.mock('../../services/prismic')

describe('Posts page', () => {
  it('renders corrently', () => {
    render(<Posts posts={posts}/>)

    expect(screen.getByText("My New Post")).toBeInTheDocument()
  })

  it('loads initial data',async () => {
    const getPrismicClientMocked = mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'my-new-post',
            data: {
              title: 'My New Post',
              content: [
                { type: 'paragraph', text: 'Post excerpt' }
              ],
            },
            last_publication_date: '2022-06-17',
          }
        ]
      })
    } as any)

    
    const response = await getStaticProps({
      previewData: undefined,
    })

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [{
            slug: 'my-new-post',
            title: 'My New Post',
            excerpt: 'Post excerpt',
            updatedAt: '16 de junho de 2022'
          }]
        }
      })
    )
  })

})