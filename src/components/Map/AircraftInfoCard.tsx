import React from 'react';
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import type { AircraftInfoCardProps } from '../../types/aircraft.types';
import { metersToFeet, msToKnots } from '../../utils/dataSky';

const AircraftInfoCard: React.FC<AircraftInfoCardProps> = ({ aircraft, onClose }) => {
  return (
    <Card
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        minWidth: 300,
        maxWidth: 340,
        zIndex: 1000,
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        '@media (max-width: 768px)': {
          left: '50%',
          transform: 'translateX(-50%)',
          minWidth: 'calc(100% - 32px)',
          maxWidth: 'calc(100% - 32px)',
        }
      }}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
        
        <Box sx={{ fontSize: 14, lineHeight: 1.8 }}>
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
          sx={{ 
            mt: 2,
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'white'
            }
          }}
        >
          선택 해제
        </Button>
      </CardContent>
    </Card>
  );
};

export default AircraftInfoCard;