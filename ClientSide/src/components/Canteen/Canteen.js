import { useHistory } from "react-router-dom";
import React from "react";
import "./canteen.css";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';


const Canteen = ({canteen, setSelectedCanteen}) => {

    let history = useHistory();

    const showDetails = () => {
        history.push("/details");
        setSelectedCanteen(canteen);
    }

    return (
        <Card className="everySnd" sx={{
            maxWidth: 'sm',
            width: '100%',
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}
        >
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {canteen.name}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    {canteen.city}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {canteen.address}
                </Typography>

            </CardContent>

            <CardActions
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    width: '100%',
                }}
            >
                <Button
                    size="small"
                    onClick={showDetails}
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        color: '#38800e'
                    }}
                >
                    Speiseplan
                </Button>
            </CardActions>
        </Card>
    )

};

export default Canteen;
