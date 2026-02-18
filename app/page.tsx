import React from 'react'
import About from '@/components/About/about'
import Main from '@/components/Main/main'
import Menu from '@/components/Menu/menu'
const page = () => {
  return (
    <div>
      <Menu/>
      <Main/>
      <About/>
    </div>
  )
}

export default page