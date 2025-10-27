import React from 'react';
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import type { AircraftInfoCardProps } from '../../types/aircraft.types';
import { metersToFeet, msToKnots } from '../../utils/dataSky';
import './GoogleMap.module.scss';

const AircraftInfoCard: React.FC<AircraftInfoCardProps> = ({ aircraft, onClose }) => {
  return (
    <Card className="aircraft-card">
      <CardContent>
        <Box className="aircraft-card__header">
          <Typography component="span" sx={{ fontSize: 28 }}>✈️</Typography>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              {aircraft.callsign}
            </Typography>
            <Chip 
              label={aircraft.country} 
              size="small" 
              sx={{ 
                mt: 0.5,
                height: 20,
                fontSize: '0.7rem',
                bgcolor: '#e3f2fd',
                color: '#1976d2',
                fontWeight: 500
              }}
            />
          </Box>
        </Box>

        <Box className="aircraft-card__info">
          <Typography variant="body2">
            <strong>ICAO24:</strong> {aircraft.id.toUpperCase()}
          </Typography>
          <Typography variant="body2">
            <strong>고도:</strong> {metersToFeet(aircraft.altitude).toLocaleString()} ft
            ({Math.round(aircraft.altitude).toLocaleString()} m)
          </Typography>
          <Typography variant="body2">
            <strong>속도:</strong> {msToKnots(aircraft.velocity)} knots
            ({Math.round(aircraft.velocity * 3.6)} km/h)
          </Typography>
          <Typography variant="body2">
            <strong>방향:</strong> {Math.round(aircraft.heading)}°
          </Typography>
          <Typography variant="body2">
            <strong>좌표:</strong> {aircraft.latitude.toFixed(4)}°N, {aircraft.longitude.toFixed(4)}°E
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: 12 }}>
            마지막 업데이트: {new Date(aircraft.lastUpdate).toLocaleTimeString('ko-KR')}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={onClose}
          fullWidth
          className="aircraft-card__button"
        >
          선택 해제
        </Button>
      </CardContent>
    </Card>
  );
};

export default AircraftInfoCard;