import React from 'react';
import { AppBar, Drawer, Toolbar, Typography } from '@mui/material';
import TemporaryDrawer from './TemporaryDrawer';
import { Box } from '@mui/system';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button'


export default function Layout({ user, loggedIn, setLoggedIn, databaseLocation, children }) {

    const location = useLocation().pathname;

    return (

        <div>
            <AppBar
                position="sticky"
                sx={{
                    display: "flex",
                    backgroundColor: '#919191',
                    minHeight: '116px',
                    alignItems: 'center',
                    width: '100%',
                    paddingRight: 0
                }}>
                {loggedIn === false &&
                    <Toolbar
                        disableGutters
                        sx={{
                            marginTop: 1,
                            justifyContent: "center",
                            paddingRight: 0
                        }}>

                        <Typography
                            variant='h4'sx={{
                            marginTop: '2rem',
                            marginBottom: '2rem',
                            color: '#FFFFFF',
                        }}
                        >LOGO in Arbeit</Typography>
                    </Toolbar> }
                {loggedIn === true &&
                    <Toolbar
                        disableGutters
                        sx={{
                            marginTop:  3,
                            display: "flex",
                            justifyContent: "space-between",
                            width: '100%'

                        }}>
                        <Box sx={{marginLeft: '1rem'}}>
                            <Button component={Link} to="/home">

                            </Button>
                        </Box>
                        <Typography
                            variant='h2'
                            sx={{
                                fontWeight: '500',
                                fontSize: '3rem',
                                color: '#E4E6ED'
                            }}
                        >
                            Mensa Spot
                        </Typography>

                        <TemporaryDrawer
                            setLoggedIn={setLoggedIn}
                            databaseLocation={databaseLocation}
                            user={user}
                            variant='permanent'
                            anchor='right'
                            sx={{
                                width: '20%',
                                backgroundColor: '#ffffff',
                            }}
                        >
                        </TemporaryDrawer>
                    </Toolbar>
                }
            </AppBar>

            <div>{children}</div>
        </div>
    )};
