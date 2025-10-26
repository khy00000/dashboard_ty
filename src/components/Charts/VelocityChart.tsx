import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartProps } from '../../types/aircraft.types';
import styles from './Charts.module.scss';

const VelocityChart: React.FC<ChartProps> = ({ data }) => {
  const avgVelocity = (data.reduce((sum, d) => sum + d.velocity, 0) / data.length).toFixed(1);
  const maxVelocity = Math.max(...data.map(d => d.velocity)).toFixed(1);

  return (
    <Paper className={styles.chartContainer}>
      <Typography variant="h6" gutterBottom>
        🚀 속도 변화
      </Typography>
      
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="time" 
            stroke="#666"
            style={{ fontSize: 12 }}
            tick={{ fill: '#666' }}
          />
          <YAxis 
            stroke="#666"
            style={{ fontSize: 12 }}
            tick={{ fill: '#666' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.98)', 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            formatter={(value: number) => [`${value.toFixed(1)} m/s (${Math.round(value * 3.6)} km/h)`, '속도']}
          />
          <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
          <Line
            type="monotone"
            dataKey="velocity"
            stroke="#4caf50"
            strokeWidth={3}
            name="속도 (m/s)"
            dot={{ r: 3, fill: '#4caf50', strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <Box className={`${styles.stats} ${styles.humidity}`}>
        <Typography variant="body2">
          <strong>평균:</strong> {avgVelocity}m/s ({Math.round(parseFloat(avgVelocity) * 3.6)}km/h)
          <strong style={{ marginLeft: 12 }}>최고:</strong> {maxVelocity}m/s
        </Typography>
      </Box>
    </Paper>
  );
};

export default VelocityChart;