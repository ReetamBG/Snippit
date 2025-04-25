import { LoaderCircle } from 'lucide-react'
import React from 'react'

const Loading = () => {
  return (
    <div className="w-full h-[calc(100vh-12rem)] flex justify-center items-center">
      <LoaderCircle className="animate-spin size-15" />
    </div>
  )
}

export default Loading