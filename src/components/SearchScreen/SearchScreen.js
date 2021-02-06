import axios from 'axios'
import React,{useEffect, useState} from 'react'
import "./SearchScreen.css"
const BILL_API_LINK = "https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Public_Service_WebMercator/MapServer/50/query?where=1%3D1&outFields=*&outSR=4326&f=json"
const SearchScreen = () => {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [agencies, setAgencies] = useState([])
    const [invalidate, setInvalidate] = useState(true)

    const onHandleSearch = async (e) => {
        if (e.key === "Enter"){
            try{
                const res = await axios.get(BILL_API_LINK)
                setAgencies(res.data.features)
            }
            catch(err){
                console.log(err)
            }
        }
    }   

    useEffect(() => {
        axios.get(BILL_API_LINK)
        .then(res => {
            setAgencies(res.data.features)
        })
        .catch(err => console.log(err))
    }, [])

    return (
        <div className="container">
            <div className={!open ? `search` : `search open`}>
                <input value={value} onKeyDown={onHandleSearch} onChange={(e) => setValue(e.target.value)} type="search" class="search-box"/>
                <span className="search-button" onClick={() => setOpen(!open)}>
                    <span className="search-icon"></span>
                </span>
            </div>
            <div>
                {agencies && agencies
                    .filter((agency) => agency["attributes"]["AGENCY"].includes(value))
                    .map((agency) => {
                        return (
                            <div className="text-style">{agency["attributes"]["AGENCY"]}</div>
                        )
                    })
                    }
                </div>
        </div>
    )
}

export default SearchScreen
