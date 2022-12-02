import './App.css';
import CanteensList from './components/CanteensList/CanteensList';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Login from "./Pages/Login/Login";
import Details from "./Pages/Details/Details";
import { React, useState, useEffect } from 'react';
import Axios from "axios";
import Layout from './components/Layout';
import { createTheme, ThemeProvider } from '@mui/material/styles';



function App() {
    const newTheme = createTheme({
        palette: {
            primary: {
                main: '#92AD94',
                sub: '#05160B',
            },
            secondary: {
                main: '#F06543',
                sub: '#E4E6ED',
            },
        },
    });

    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState({});
    const [selectedCanteen, setSelectedCanteen] = useState({});
    const [canteens, setCanteens] = useState([]);

    const databaseLocation = process.env.REACT_APP_DATABASE_LOCATION || "https://mensario.herokuapp.com";
    // const initalRequest = `https://openmensa.org/api/v2/canteens?near[lat]=52.5200&near[lng]=13.4050&near[dist]=50`;

    useEffect( () => {
        // getCanteensFromAPI();
        console.log("Database: " + databaseLocation);
        if(loggedIn) {
            console.log("Loading canteens..");
            getCanteensFromDatabase();
            // getCanteensFromAPI();
        }
    }, [loggedIn])


    useEffect( () => {
        if(databaseLocation.includes("local")) { console.log("Updating user.."); }
    }, [setUser])


    // useEffect( () => {
    //     insertCanteens();
    // }, [canteens])


    // const getCanteensFromAPI = async () => {
    //     const response = await fetch(initalRequest);
    //     const data = await response.json();
    //     setCanteens(data);
    //     canteens.map(canteen => {
    //         canteen.isSelected = false;
    //     })
    //     console.log(data);
    // }

    const getCanteensFromDatabase = async () => {

        Axios.get(`${databaseLocation}/getCanteens`).then( (response) => {
            setCanteens(response.data);
            if(databaseLocation.includes("local")) { console.log("Successfully fetched canteens from database!"); }
        }).catch( (err) => {
            if(databaseLocation.includes("local")) { console.log("Error: Fetching canteens from database failed!"); }
        });
    }

    // const insertCanteens = async () => {

    //     // let requests = [];
    //     if(databaseLocation.includes("local")) { console.log("Inserting Canteens..."); }
    //     canteens.map(async canteen => {
    //         console.log("Canteen " + canteen.id);
    //         await Axios.post(`${databaseLocation}/api/insert`, {
    //             id: canteen.id,
    //             name: canteen.name,
    //             city: canteen.city,
    //             address: canteen.address,
    //             lat: canteen.coordinates[0],
    //             lng: canteen.coordinates[1]
    //         }).then( (response) => {
    //             if(databaseLocation.includes("local")) { console.log("Inserted somewhat"); }
    //         });
    //     })
    //     // axios.all(requests);
    // };

    return (
        <div className="App">

            <Router>
                <ThemeProvider theme={newTheme}>
                    <Layout user={user} loggedIn={loggedIn} setLoggedIn={setLoggedIn} databaseLocation={databaseLocation}>
                        <Switch>
                            { loggedIn === false && <Route path="/" component={ () => <Login
                                setLoggedIn={setLoggedIn}
                                setUser={setUser}
                                desiredPath={window.location.pathname}
                                databaseLocation={databaseLocation} />} /> }

                            { loggedIn === true && <Route path="/home" component={ () =>
                                <CanteensList
                                    canteens={canteens}
                                    setCanteens={setCanteens}
                                    user={user}
                                    setUser={setUser}
                                    setSelectedCanteen={setSelectedCanteen}
                                    databaseLocation={databaseLocation} />
                            } /> }

                            { loggedIn === true && <Route exact path="/details" component={ () => <Details selectedCanteen={selectedCanteen} setUser={setUser} user={user} databaseLocation={databaseLocation} />
                            } /> }
                        </Switch>
                    </Layout>
                </ThemeProvider>
            </Router>
        </div>
    );
}

export default App;
