import axios from 'axios'
import React,{useEffect, useState} from 'react'
import Button from '@material-ui/core/Button';

import "./SearchScreen.css"
const BILL_API_LINK = "https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Public_Service_WebMercator/MapServer/50/query?where=1%3D1&outFields=*&outSR=4326&f=json"
const SearchScreen = () => {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [agencies, setAgencies] = useState([])
    const [invalidate, setInvalidate] = useState(true)
    const [agencyNames, setAgencyNames] = useState([])

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
        let newAgencyNames = []
        axios.get(BILL_API_LINK)
        .then(res => {
            res.data.features.map((agency) => newAgencyNames.push(agency["attributes"]["AGENCY"]))
            newAgencyNames = newAgencyNames.filter(function(item, pos) {
                return newAgencyNames.indexOf(item) == pos;
            })
            setAgencyNames(newAgencyNames)
            setAgencies(res.data.features)
        })
        .catch(err => console.log(err))
    }, [])

    console.log(agencyNames)

    return (
        <div className="container">
            <div className="header">
                <h2>Agency Search</h2>
            </div>
            <div className={!open ? `search` : `search open`}>
                <input value={value} onKeyDown={onHandleSearch} onChange={(e) => setValue(e.target.value)} type="search" class="search-box"/>
                <span className="search-button" onClick={() => setOpen(!open)}>
                    <span className="search-icon"></span>
                </span>
            </div>
                <ul>
                {agencyNames && agencyNames
                    .filter((agency) => agency.trim().toLowerCase().includes(value.trim().toLowerCase()))
                    .map((agency) => {
                        return (
                            <li className="text-style">{agency}</li>
                        )
                    })
                    }
                </ul>
        </div>
    )
}

export default SearchScreen
