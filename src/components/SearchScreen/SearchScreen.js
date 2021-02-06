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
    const [relatedVendors, setRelatedVendors] = useState()
    const [recommendedVendors, setRecommendedVendors] = useState()

    useEffect(() => {
        let newAgencyNames = []
        let relatedVendors = {}
        let recommendedVendors = {}
        axios.get(BILL_API_LINK)
        .then(res => {
            res.data.features.map((agency) => {
                const agencyName = agency["attributes"]["AGENCY"]
                const vendorName = agency["attributes"]["VENDOR_NAME"]
                newAgencyNames.push(agencyName)
                if (relatedVendors.hasOwnProperty(agencyName)){
                    if (relatedVendors[agencyName].hasOwnProperty(vendorName)){
                        relatedVendors[agencyName][vendorName] += 1
                    }
                    else{
                        relatedVendors[agencyName][vendorName] = 1
                    }
                }
                else{
                    relatedVendors[agencyName] = {}
                }

            }
            )

        res.data.features.map((agency) => {
            const agencyName = agency["attributes"]["AGENCY"]
            const vendorName = agency["attributes"]["VENDOR_NAME"]      
            var sortable = [];
            for (var r in relatedVendors[agencyName]) {
                sortable.push([r, relatedVendors[agencyName][r]]);
            }
            
            sortable.sort(function(a, b) {
                return b[1] - a[1];
            });
            
            recommendedVendors[agencyName] = sortable.slice(0, 3)
        })
            
            newAgencyNames = newAgencyNames.filter(function(item, pos) {
                return newAgencyNames.indexOf(item) == pos;
            })
            setRecommendedVendors(recommendedVendors)
            setRelatedVendors(relatedVendors)
            setAgencyNames(newAgencyNames)
            setAgencies(res.data.features)
        })
        .catch(err => console.log(err))
    }, [])

    console.log(recommendedVendors)
    return (
        <div className="container">
            <div className="header">
                <h2>Agency Search</h2>
            </div>
            <div className={!open ? `search` : `search open`}>
                <input value={value} onChange={(e) => setValue(e.target.value)} type="search" class="search-box"/>
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
