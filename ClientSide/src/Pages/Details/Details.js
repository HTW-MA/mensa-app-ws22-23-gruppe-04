import { React, useState, useEffect } from 'react';
import Recipe from "../../components/Recipe/Recipe";
import "./details.css";
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import { Card, CardContent } from '@mui/material';

const Details = ({selectedCanteen, setUser, user, databaseLocation}) => {


    const [meals, setMeals] = useState([]);

    useEffect( () => {
        if(databaseLocation.includes("local")) { console.log("Initialized Details!"); }
    }, [])

    useEffect( async () => {
        console.log("selectedCanteen: " + selectedCanteen.id);
        try {
            const current = new Date();
            const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;
            const response = await fetch("https://openmensa.org/api/v2/canteens/"+selectedCanteen.id+"/days/"+date+"/meals");

            if(response.status === 404)
            {
                document.getElementById("error").innerHTML = "Konnte für diesen Tag keine Gerichte finden!";
                document.getElementById("error").style.display = "block";
            }
            else {
                document.getElementById("error").style.display = "none";
            }

            const data = await response.json();
            setMeals(data);
            console.log("New Meals loaded!");
        }
        catch (e) {
            console.log(e);
            setMeals([]);
        }

    }, [])

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

    function showMeals() {
                return (
                    meals.map(meal => (
                        <Recipe key={meal.id} selectedCanteen={selectedCanteen} meal={meal} setUser={setUser} user={user} databaseLocation={databaseLocation} />
                    ))
                )
            }

    return ( <div>
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                <Card sx={{
                    maxWidth: 'sm',
                    width: '90%',
                    minHeight: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: '#cefaa3',
                    marginTop: 3
                }}
                >
                    <CardContent>
                        <Typography gutterBottom variant="h4" component="div">
                            {selectedCanteen.name}
                        </Typography>
                        <Typography variant="h5" color="text.secondary">
                            {selectedCanteen.address}
                        </Typography>
                        <Link to="/home">
                            <Button
                                sx={{
                                    color: 'rgba(255,54,0,0.75)'
                                }}
                            >
                                <Typography variant='h8'>Zurück</Typography>

                            </Button>
                        </Link>

                    </CardContent>
                </Card>
            </Box>
            <Box>
                <label>Liste der angebotenen Mahlzeiten</label>
            </Box>
                <showMeals/>

        </div>
    );
}

export default Details;
