import { render, screen } from '@testing-library/react'
import { Header } from '.'

jest.mock("next/router", () => {
  return {
    useRouter() {
      return {
        asPath: '/'
      }
    }
  }
})

jest.mock("next-auth/client", () => {
  return {
    useSession() {
      return [null , false]
    }
  }
})

describe('Header component', () => {

    it('renders correctly', () => {
      //const { getByText } = render(  forma de usar menos semantica
      render(
          <Header />
      )
        // expect(getByText('Home')).toBeInTheDocument() forma de usar menos semantica
        // expect(getByText('Posts')).toBeInTheDocument()
        expect(screen.getByText('Home')).toBeInTheDocument() //test de texto "home" vai ser encontrado
        expect(screen.getByText('Posts')).toBeInTheDocument()
      })

})
