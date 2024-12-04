import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {ImCross} from 'react-icons/im'
import { useContext, useState } from 'react'
import { UserContext } from '../context/UserContext'
import { URL } from '../url'
import axios from 'axios'
import {  useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'

const CreatePost = () => {
   
    const [title,setTitle]=useState("")
    const [desc,setDesc]=useState("")
    const [files,setFiles]=useState([])
    const {user}=useContext(UserContext)
    const [cat,setCat]=useState("")
    const [cats,setCats]=useState([])
    const [previewImages, setPreviewImages] = useState([])
    const [errors, setErrors] = useState({})

    const navigate=useNavigate()

    const deleteCategory=(i)=>{
       let updatedCats=[...cats]
       updatedCats.splice(i)
       setCats(updatedCats)
    }

    const addCategory=()=>{
        if(cat.length>0){
          let updatedCats=[...cats]
          updatedCats.push(cat)
          setCat("")
          setCats(updatedCats)
        }
    }

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files)
        setFiles(selectedFiles)
        
        // Create image previews
        const previews = selectedFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader()
                reader.onloadend = () => {
                    resolve(reader.result)
                }
                reader.readAsDataURL(file)
            })
        })

        Promise.all(previews).then(setPreviewImages)
    }

    const removeImage = (indexToRemove) => {
        // Remove image from files
        const updatedFiles = files.filter((_, index) => index !== indexToRemove)
        setFiles(updatedFiles)

        // Remove image preview
        const updatedPreviews = previewImages.filter((_, index) => index !== indexToRemove)
        setPreviewImages(updatedPreviews)
    }

    const validateForm = () => {
        const newErrors = {}

        // Title validation
        if (!title.trim()) {
            newErrors.title = "Title is required"
        } else if (title.trim().length < 5) {
            newErrors.title = "Title must be at least 5 characters long"
        } else if (title.trim().length > 100) {
            newErrors.title = "Title cannot exceed 100 characters"
        }

        // Description validation
        if (!desc.trim()) {
            newErrors.desc = "Description is required"
        } else if (desc.trim().length < 20) {
            newErrors.desc = "Description must be at least 20 characters long"
        } else if (desc.trim().length > 2000) {
            newErrors.desc = "Description cannot exceed 2000 characters"
        }

        // Categories validation
        if (cats.length === 0) {
            newErrors.cats = "At least one category is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleCreate=async (e)=>{
        e.preventDefault()
        
        // Validate form before submission
        if (!validateForm()) {
            return
        }

        const post={
          title,
          desc,
          username:user.username,
          userId:user._id,
          categories:cats,
          photos: []
        }

        // Upload multiple files
        if(files.length > 0){
          const uploadPromises = files.map(async (file) => {
            const data = new FormData()
            const filename = Date.now() + file.name
            data.append("img", filename)
            data.append("file", file)
            
            try {
              await axios.post(URL+"/api/upload", data)
              return filename
            } catch(err) {
              console.log(err)
              return null
            }
          })

          // Wait for all uploads and filter out any failures
          const uploadedFilenames = await Promise.all(uploadPromises)
          post.photos = uploadedFilenames.filter(filename => filename !== null)
        }
        
        //post upload
        try{
          const res = await axios.post(URL+"/api/posts/create", post, {withCredentials:true})
          navigate("/posts/post/"+res.data._id)
        }
        catch(err){
          console.log(err)
        }
    }

  return (
    <div>
        <Navbar/>
        <div className='px-6 md:px-[200px] mt-8'>
        <h1 className='font-bold md:text-2xl text-xl '>Create a post</h1>
        <form className='w-full flex flex-col space-y-4 md:space-y-8 mt-4'>
          <div>
            <input 
              onChange={(e)=>setTitle(e.target.value)} 
              type="text" 
              placeholder='Enter post title' 
              className={`w-full px-4 py-2 outline-none border-2 ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:border-black transition-colors duration-300`}
            />
            {errors.title && <p className='text-red-500 text-sm mt-1'>{errors.title}</p>}
          </div>
          
          <div className='flex flex-col'>
            <input 
              onChange={handleFileChange} 
              type="file"  
              multiple
              className='px-4 py-2 border-2 border-gray-300 rounded-md'
            />
            {previewImages.length > 0 && (
              <div className='grid grid-cols-3 gap-4 mt-4 mb-4'>
                {previewImages.map((preview, index) => (
                  <div key={index} className='relative'>
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className='w-full h-48 object-cover rounded-md'
                    />
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className='absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors'
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className='flex flex-col'>
            <div className='flex items-center space-x-4 md:space-x-8'>
                <input 
                  value={cat} 
                  onChange={(e)=>setCat(e.target.value)} 
                  className='px-4 py-2 outline-none border-2 border-gray-300 rounded-md focus:border-black transition-colors duration-300' 
                  placeholder='Enter post category' 
                  type="text"
                />
                <div 
                  onClick={addCategory} 
                  className='bg-black text-white px-4 py-2 font-semibold cursor-pointer rounded-md hover:bg-gray-800 transition-colors'
                >
                  Add
                </div>
            </div>

            {/* categories */}
            <div className='flex px-4 mt-3'>
            {cats?.map((c,i)=>(
                <div key={i} className='flex justify-center items-center space-x-2 mr-4 bg-gray-200 px-2 py-1 rounded-md'>
                <p>{c}</p>
                <p onClick={()=>deleteCategory(i)} className='text-white bg-black rounded-full cursor-pointer p-1 text-sm'><ImCross/></p>
            </div>
            ))}
            </div>
            {errors.cats && <p className='text-red-500 text-sm mt-1 px-4'>{errors.cats}</p>}
          </div>
          
          <div>
            <textarea 
              onChange={(e)=>setDesc(e.target.value)} 
              rows={15} 
              cols={30} 
              className={`w-full px-4 py-2 outline-none border-2 ${errors.desc ? 'border-red-500' : 'border-gray-300'} rounded-md focus:border-black transition-colors duration-300`} 
              placeholder='Enter post description'
            />
            {errors.desc && <p className='text-red-500 text-sm mt-1'>{errors.desc}</p>}
          </div>
          
          <button 
            onClick={handleCreate} 
            className='bg-black w-full md:w-[20%] mx-auto text-white font-semibold px-4 py-2 md:text-xl text-lg rounded-md hover:bg-gray-800 transition-colors'
          >
            Create
          </button>
        </form>

        </div>
        <Footer/>
    </div>
  )
}

export default CreatePost