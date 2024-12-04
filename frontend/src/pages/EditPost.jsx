import { useContext, useEffect, useState } from "react"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import {ImCross} from 'react-icons/im'
import axios from "axios"
import { URL } from "../url"
import { useNavigate, useParams } from "react-router-dom"
import { UserContext } from "../context/UserContext"


const EditPost = () => {

    const postId=useParams().id
    const {user}=useContext(UserContext)
    const navigate=useNavigate()
    const [title,setTitle]=useState("")
    const [desc,setDesc]=useState("")
    const [file,setFile]=useState(null)
    const [cat,setCat]=useState("")
    const [cats,setCats]=useState([])
    
    // New state for validation errors
    const [errors, setErrors] = useState({
        title: "",
        desc: "",
        categories: ""
    })

    const fetchPost=async()=>{
      try{
        const res=await axios.get(URL+"/api/posts/"+postId)
        setTitle(res.data.title)
        setDesc(res.data.desc)
        setFile(res.data.photo)
        setCats(res.data.categories)
      }
      catch(err){
        console.log(err)
      }
    }

    // Validation function
    const validateForm = () => {
        let isValid = true;
        let newErrors = {
            title: "",
            desc: "",
            categories: ""
        };

        // Title validation
        if (!title.trim()) {
            newErrors.title = "Title cannot be empty";
            isValid = false;
        } else if (title.trim().length < 5) {
            newErrors.title = "Title must be at least 5 characters long";
            isValid = false;
        } else if (title.trim().length > 100) {
            newErrors.title = "Title cannot exceed 100 characters";
            isValid = false;
        }

        // Description validation
        if (!desc.trim()) {
            newErrors.desc = "Description cannot be empty";
            isValid = false;
        } else if (desc.trim().length < 20) {
            newErrors.desc = "Description must be at least 20 characters long";
            isValid = false;
        } else if (desc.trim().length > 2000) {
            newErrors.desc = "Description cannot exceed 2000 characters";
            isValid = false;
        }

        // Categories validation
        if (cats.length === 0) {
            newErrors.categories = "At least one category is required";
            isValid = false;
        } else if (cats.length > 5) {
            newErrors.categories = "Maximum 5 categories allowed";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    }

    const handleUpdate=async (e)=>{
      e.preventDefault()
      
      // Validate form before submission
      if (!validateForm()) {
        return;
      }

      const post={
        title,
        desc,
        username:user.username,
        userId:user._id,
        categories:cats
      }

      if(file){
        const data=new FormData()
        const filename=Date.now()+file.name
        data.append("img",filename)
        data.append("file",file)
        post.photo=filename
        
        try{
          const imgUpload=await axios.post(URL+"/api/upload",data)
        }
        catch(err){
          console.log(err)
        }
      }
     
      try{
        const res=await axios.put(URL+"/api/posts/"+postId,post,{withCredentials:true})
        navigate("/posts/post/"+res.data._id)
      }
      catch(err){
        console.log(err)
      }
    }

    useEffect(()=>{
      fetchPost()
    },[postId])

    const deleteCategory=(i)=>{
       let updatedCats=[...cats]
       updatedCats.splice(i)
       setCats(updatedCats)
    }

    const addCategory=()=>{
        // Validate category before adding
        if (!cat.trim()) {
            return;
        }

        let updatedCats=[...cats]
        updatedCats.push(cat)
        setCat("")
        setCats(updatedCats)
    }

  return (
    <div>
        <Navbar/>
        <div className='px-6 md:px-[200px] mt-8'>
        <h1 className='font-bold md:text-2xl text-xl '>Update a post</h1>
        <form className='w-full flex flex-col space-y-4 md:space-y-8 mt-4'>
          <div>
            <input 
              onChange={(e)=>setTitle(e.target.value)} 
              value={title} 
              type="text" 
              placeholder='Enter post title' 
              className={`px-4 py-2 outline-none border-2 rounded-md transition-colors duration-300 w-full 
                ${errors.title ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <input 
            onChange={(e)=>setFile(e.target.files[0])} 
            type="file"  
            className='px-4'
          />

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
                  className='bg-black text-white px-4 py-2 font-semibold cursor-pointer '
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
            {errors.categories && <p className="text-red-500 text-sm mt-1 px-4">{errors.categories}</p>}
          </div>

          <div>
            <textarea 
              onChange={(e)=>setDesc(e.target.value)} 
              value={desc} 
              rows={15} 
              cols={30} 
              className={`px-4 py-2 outline-none border-2 rounded-md transition-colors duration-300 w-full 
                ${errors.desc ? 'border-red-500' : 'border-gray-300 focus:border-black'}`} 
              placeholder='Enter post description'
            />
            {errors.desc && <p className="text-red-500 text-sm mt-1">{errors.desc}</p>}
          </div>

          <button 
            onClick={handleUpdate} 
            className='bg-black w-full md:w-[20%] mx-auto text-white font-semibold px-4 py-2 md:text-xl text-lg'
          >
            Update
          </button>
        </form>

        </div>
        <Footer/>
    </div>
  )
}

export default EditPost