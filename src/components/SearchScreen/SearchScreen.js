import axios from 'axios'
import React,{useEffect, useState} from 'react'
import Button from '@material-ui/core/Button';
import CSVReader from 'react-csv-reader'
import {db} from "../../firebase/firebase"
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
    const [clicked, setClicked] = useState(false)
    const [yearly, setYearly] = useState([])
    const [monthly, setMonthly] = useState([])
    const [freq, setFreq] = useState([])
    const [showYear, setShowYear] = useState()
    const [showMonth, setShowMonth] = useState()
    const [showFreq, setShowFreq] = useState()

    const [currentClickedAgency, setCurrentClickedAgency] = useState("")

    const papaparseOptions = {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: header =>
          header
            .toLowerCase()
            .replace(/\W/g, '_')
      }


    const handleClick = (e, agency) => {
        setCurrentClickedAgency(e.target.id)
        const curAgencyYear = yearly && yearly.find((agent) => agent.agency == agency)
        const curAgencyMonth = monthly && monthly.find((agent) => agent.agency == agency)
        const curAgencyFreq = freq && freq.find((agent) => agent.agency == agency)
        setShowYear(curAgencyYear.avg_yearly)
        setShowMonth(curAgencyMonth.avg_monthly)
        setShowFreq(curAgencyFreq.avg_frequency)
        console.log(curAgencyYear)
    } 

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

    console.log(yearly)
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
                            <div>
                                <li id={agency} onClick={(e) => handleClick(e, agency)} className="text-style">{agency}</li>
                                {currentClickedAgency == agency ? (
                                    <div className="information-container">
                                        <div>Average Yearly Transaction Amount: {showYear}</div>
                                        <div>Average Monthly Transaction Amount: {showMonth}</div>
                                        <div>Average Transaction Frequency Monthly: {showFreq}</div>
                                        <ul>
                                            {recommendedVendors && recommendedVendors[agency]
                                            .map((vendor)=>{
                                                return <li>{vendor[0]}</li>
                                            })
                                            }
                                        </ul>

                                    </div>
                                ) : 
                                null
                                }
                            </div>
                        )
                    })
                    }
                </ul>
            <CSVReader
                cssClass="csv-reader-input"
                label="Select CSV for yearly spending"
                onFileLoaded={(data, fileInfo) => setYearly(data)}
                onError={(err) => console.log(err)}
                parserOptions={papaparseOptions}
                inputId="ObiWan"
                inputStyle={{color: 'red'}}
            />

            <CSVReader
                cssClass="csv-reader-input"
                label="Select CSV for monthly spending"
                onFileLoaded={(data, fileInfo) => setMonthly(data)}
                onError={(err) => console.log(err)}
                parserOptions={papaparseOptions}
                inputId="ObiWan"
                inputStyle={{color: 'red'}}
            />

            <CSVReader
                cssClass="csv-reader-input"
                label="Select CSV for time frequency"
                onFileLoaded={(data, fileInfo) => setFreq(data)}
                onError={(err) => console.log(err)}
                parserOptions={papaparseOptions}
                inputId="ObiWan"
                inputStyle={{color: 'red'}}
            />
        </div>
    )
}

export default SearchScreen
