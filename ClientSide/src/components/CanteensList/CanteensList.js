import React, {useState, useEffect, useCallback} from "react";
import Canteen from '../Canteen/Canteen';
import "./canteensList.css";
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import { Input, AppBar } from "@mui/material";
import { alpha } from '@mui/material/styles';
import { FormControlLabel } from "@mui/material";



const CanteensList = ({canteens, setCanteens, user, setUser, setSelectedCanteen, databaseLocation}) => {

    const [CanteensListInformation, setCanteensListInformation] = useState({filteredList: canteens, searchText: "", OnlyOpenCanteens: false});
    const [filteredList, setFilteredList] = useState([]);
    const [currentView, setCurrentView] = useState("List View");

    function TabPanel(props) {
        const { children, value, index, ...other } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 3 }}>
                        <Typography>{children}</Typography>
                    </Box>
                )}
            </div>
        );
    }

    const ViewMenu = () => {

        const [value, setValue] = useState(0);

        const handleChange = (e, newValue) => {
            console.log("handleChange.newValue: " + newValue);
            console.log("handleChange.innerHTML: " + e.target.innerHTML);
            setValue(newValue);
        };


        return (
            <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <AppBar
                        position='relative'
                        sx={{
                            display: "flex",
                            alignItems: 'center',
                            maxWidth: '200px',
                        }}
                    >
                    </AppBar>
                </Box>
                <TabPanel value={value} index={0}>
                    <StackList />
                </TabPanel>

            </Box>
        )
    }

    const SearchSection = () => {

        const [searchText, setSearchText] = useState("");

        const updateFilteredList = (newSearchText, newOnlyOpenCanteens) => {
            console.log("newOnlyOpenCanteens: " + newOnlyOpenCanteens)
            if(newOnlyOpenCanteens) {
                showOnlyOpenCanteens(newSearchText);
            }
            else {
                const newList = canteens.filter(canteen => canteen.name.toLowerCase().includes(newSearchText.toLowerCase()));
                setCanteensListInformation({filteredList:newList, searchText:newSearchText, OnlyOpenCanteens:false});
                console.log("setOnlyOpenCanteens to false..")
            }
        }

        const showOnlyOpenCanteens = async (newSearchText) => {
            const results = await filter(canteens, async canteen => {

                if(canteen.name.toLowerCase().includes(newSearchText.toLowerCase())) {
                    let canteenOpen = await isCanteenOpen(canteen);
                    if(canteenOpen == true) {
                        return canteens;
                    }
                }
            })
            setCanteensListInformation({filteredList:results, searchText:newSearchText, OnlyOpenCanteens:true});
            console.log("setOnlyOpenCanteens to true..")
        }

        async function filter(arr, callback) {
            const fail = Symbol()
            return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i=>i !== fail)
        }

        const isCanteenOpen = async (canteen) => {

            let bool = false;
            const todaysDate = new Date().toISOString().split("T")[0];

            const response = await fetch("https://openmensa.org/api/v2/canteens/"+canteen.id+"/days/"+todaysDate+"/meals")
                .then(response => response.json())
                .then(data => {
                    bool = true;
                })
                .catch(err => {
                    console.log("isCanteenOpen Exception < !!!");
                    bool = false;
                });
            return bool;
        }

        const handleOnlyOpenCanteens = (e) => {

            console.log("event.target.checked: " + e.target.checked);
            if(e.target.checked) {
                updateFilteredList(CanteensListInformation.searchText, true);
            }
            else {
                updateFilteredList(CanteensListInformation.searchText, false);
            }
        }

        return (
            <div className="searchSection">
                <Box
                    sx={{
                        marginTop: 5
                    }}
                >
                    {   <FormControlLabel
                        value="top"
                        control={<Switch
                            checked={CanteensListInformation.OnlyOpenCanteens}
                            onChange={handleOnlyOpenCanteens}
                            inputProps={{ 'aria-label': 'controlled' }}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: '#F06543',
                                    '&:hover': {
                                        backgroundColor: alpha('#F06543'),
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        backgroundColor: '#F06543',
                                    },
                                    '& $track': {
                                        backgroundColor: '#F06543',
                                    },
                                }}
                            }
                        />}
                        label="Only open canteens"
                        labelPlacement="start"
                    />
                    }
                </Box>
                <ViewMenu />
            </div>
        )
    }

    const StackList = () => {
        return (
            <Stack spacing={2}
                   sx={{
                       display: 'flex',
                       justifyContent: 'center',
                       alignItems: 'center',

                   }}
            >
                { CanteensListInformation.filteredList.map( (canteen, index) => {
                    return (
                        <Canteen
                            key={canteen.id}
                            index={index}
                            canteens={canteens}
                            setCanteens={setCanteens}
                            canteen={canteen}
                            user={user}
                            setUser={setUser}
                            setSelectedCanteen={setSelectedCanteen}
                            databaseLocation={databaseLocation}
                        />
                    )}) }

            </Stack>
        )
    }




    return (
        <div className="CanteensList">
            <SearchSection />
        </div>
    )
}


export default CanteensList;
