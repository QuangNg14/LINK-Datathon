import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button';
import CSVReader from 'react-csv-reader'
import { db } from "../../firebase/firebase"
import "./SearchScreen.css"
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import keywords from "../../data/data.js"

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const useStyles = makeStyles({
  table: {
    minWidth: 700,
  },
});

const checkNumber = (number) => {
  if (number < 500){
    return "Low"
  }
  else if (number >= 500 && number < 626){
    return "Medium"
  }
  else{
    return "High"
  }
}



const BILL_API_LINK = "https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Public_Service_WebMercator/MapServer/50/query?where=1%3D1&outFields=*&outSR=4326&f=json"
const SearchScreen = () => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [agencies, setAgencies] = useState([])
  const [invalidate, setInvalidate] = useState(true)
  const [agencyNames, setAgencyNames] = useState([])
  const [relatedVendors, setRelatedVendors] = useState()
  const [recommendedVendors, setRecommendedVendors] = useState()
  const [vendorDescription, setVendorDescription] = useState()
  const [transactionPerAgency, setTransactionPerAgency] = useState()
  const [clicked, setClicked] = useState(false)
  const [yearly, setYearly] = useState([])
  const [monthly, setMonthly] = useState([])
  const [freq, setFreq] = useState([])
  const [showYear, setShowYear] = useState()
  const [showMonth, setShowMonth] = useState()
  const [showFreq, setShowFreq] = useState()
  const [industry, setIndustry] = useState("")
  const [low, setLow] = useState([])
  const [medium, setMedium] = useState([])
  const [high, setHigh] = useState([])
  const [curClass, setCurClass] = useState([])

  const classes = useStyles();

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


  const handleClick = (e, agency, vendor) => {
    setCurrentClickedAgency(e.target.id)
    const curAgencyYear = yearly && yearly.find((agent) => agent.agency == agency)
    const curAgencyMonth = monthly && monthly.find((agent) => agent.agency == agency)
    const curAgencyFreq = freq && freq.find((agent) => agent.agency == agency)
    setShowYear(curAgencyYear && curAgencyYear.avg_yearly)
    setShowMonth(curAgencyMonth && curAgencyMonth.avg_monthly)
    setShowFreq(curAgencyFreq && curAgencyFreq.avg_frequency)

    var sortable2 = [];
    yearly && yearly.map((year) => {
      sortable2.push([year.agency, year.avg_yearly])
    })

    sortable2.sort(function (a, b) {
      return b[1] - a[1];
    });

    for(var i = 0; i < sortable2.length; i++){
      if(checkNumber(sortable2[i][1]) == "High"){
        setHigh([...high, sortable2[i][0]])
      }
      else if(checkNumber(sortable2[i][1]) == "Medium"){
        setMedium([...medium, sortable2[i][0]])
      }
      else{
        setLow([...low, sortable2[i][0]])
      }
    }

    let mainKey = ""
    for (var i = 0; i < 3; i++) {
      const curVendor = recommendedVendors && recommendedVendors[agency][i]
      let keyWord = curVendor && vendorDescription[curVendor[0]]
      if (keyWord){
        keyWord = keyWord.trim().toLowerCase().split(",")[0]
        let check = false
        for (var i = 0; i <= 100; i++) {
          for (const [key, value] of Object.entries(keywords)) {
            if (value[i] == keyWord) {
              mainKey = key
              check = true
              break
            }
          }
          if (check) {
            break
          }
        }
      }
    }

    setIndustry(mainKey)
  }

  useEffect(() => {
    let newAgencyNames = []
    let relatedVendors = {}
    let recommendedVendors = {}
    let vendorDescription = {}
    let transactionPerAgency = {}
    axios.get(BILL_API_LINK)
      .then(res => {
        res.data.features.map((agency) => {
          const agencyName = agency["attributes"]["AGENCY"]
          const vendorName = agency["attributes"]["VENDOR_NAME"]
          const mccDescription = agency["attributes"]["MCC_DESCRIPTION"]
          const transacAmount = agency["attributes"]["TRANSACTION_AMOUNT"]
          vendorDescription[vendorName] = mccDescription
          transactionPerAgency[agencyName] = transacAmount
          newAgencyNames.push(agencyName)
          if (relatedVendors.hasOwnProperty(agencyName)) {
            if (relatedVendors[agencyName].hasOwnProperty(vendorName)) {
              relatedVendors[agencyName][vendorName] += 1
            }
            else {
              relatedVendors[agencyName][vendorName] = 1
            }
          }
          else {
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

          sortable.sort(function (a, b) {
            return b[1] - a[1];
          });

          recommendedVendors[agencyName] = sortable.slice(0, 3)
        })

        newAgencyNames = newAgencyNames.filter(function (item, pos) {
          return newAgencyNames.indexOf(item) == pos;
        })
        setRecommendedVendors(recommendedVendors)
        setRelatedVendors(relatedVendors)
        setAgencyNames(newAgencyNames)
        setAgencies(res.data.features)
        setVendorDescription(vendorDescription)
      })
      .catch(err => console.log(err))
  }, [])

    useEffect(() => {
      if (checkNumber(showYear) == "High"){
        setCurClass(high) 
      }
      else if (checkNumber(showYear) == "Medium"){
        setCurClass(medium) 
      }
      else{
        setCurClass(low) 
      }
    },[low, medium, high])
  return (
    <div className="container">
      <div className="header">
        <h2>Agency Search</h2>
      </div>

      <div className={!open ? `search` : `search open`}>
        <input value={value} onChange={(e) => setValue(e.target.value)} type="search" class="search-box" />
        <span className="search-button" onClick={() => setOpen(!open)}>
          <span className="search-icon"></span>
        </span>
      </div>
      <ul>
        {agencyNames && agencyNames
          .filter((agency) => agency.trim().toLowerCase().includes(value.trim().toLowerCase()))
          .map((agency) => {
            let rows = [
              createData('Avg Yearly Transactions ($)', `${showYear && showYear.toFixed(2)} ${checkNumber(showYear) == "Low" ? "Class C (Relatively Low)" : checkNumber(showYear) == "Medium" ? "Class B (Relatively Medium)" : "Class A (Relatively High)"}`),
              createData('Avg Monthly Transactions ($)', `${showMonth && showMonth.toFixed(2)} ${checkNumber(showMonth) == "Low" ? "Class C (Relatively Low)" : checkNumber(showMonth) == "Medium" ? "Class B (Relatively Medium)" : "Class A (Relatively High)"}`),
              createData('Avg Monthly Transactions Frequency (times/month)', showFreq && showFreq.toFixed(2)),
              createData('Most Suitable Industry', industry),
              createData('Recommended Vendors', recommendedVendors && `${recommendedVendors[agency]
                .map((agent) => {return `${agent[0]} `})
              }`),
              createData('Similar Agencies', curClass && `${curClass.slice(0, 3).map((agent) => {return `${agent} `})
              }`),
            ];
            return (
              <div>
                <li id={agency} onClick={(e) => handleClick(e, agency)} className="text-style">{agency}</li>
                {currentClickedAgency == agency ? (
                  <div className="information-container">
                    <div style={{width: 600, display:"flex", justifyContent:"center"}}>
                    <TableContainer component={Paper}>
                      <Table className={classes.table} aria-label="customized table">
                        <TableBody>
                          {rows.map((row) => (
                            <StyledTableRow key={row.name}>
                              <StyledTableCell component="th" scope="row">
                                {row.name}
                              </StyledTableCell>
                              <StyledTableCell align="right">{row.calories}</StyledTableCell>
                              <StyledTableCell align="right">{row.fat}</StyledTableCell>
                              <StyledTableCell align="right">{row.carbs}</StyledTableCell>
                              <StyledTableCell align="right">{row.protein}</StyledTableCell>
                              <StyledTableCell align="right">{row.protein}</StyledTableCell>
                            </StyledTableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    </div>
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
        inputStyle={{ color: 'red' }}
      />

      <CSVReader
        cssClass="csv-reader-input"
        label="Select CSV for monthly spending"
        onFileLoaded={(data, fileInfo) => setMonthly(data)}
        onError={(err) => console.log(err)}
        parserOptions={papaparseOptions}
        inputId="ObiWan"
        inputStyle={{ color: 'red' }}
      />

      <CSVReader
        cssClass="csv-reader-input"
        label="Select CSV for time frequency"
        onFileLoaded={(data, fileInfo) => setFreq(data)}
        onError={(err) => console.log(err)}
        parserOptions={papaparseOptions}
        inputId="ObiWan"
        inputStyle={{ color: 'red' }}
      />
    </div>
  )
}

export default SearchScreen
