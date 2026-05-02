import { useEffect, useState } from 'react';
import { OSM_STYLE_URL } from '../constants';

export function useMapStyle() {
  const [baseStyle, setBaseStyle] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(OSM_STYLE_URL)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setBaseStyle(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return baseStyle;
}

export function useAlarmState() {
  const [alarmRadius,   setAlarmRadius]   = useState(300);
  const [earlyWarning,  setEarlyWarning]  = useState(true);
  const [warningRadius, setWarningRadius] = useState(500);
  const [alarmSound,    setAlarmSound]    = useState('Rise & Shine');
  const [vibration,     setVibration]     = useState('Strong');

  return {
    alarmRadius,   setAlarmRadius,
    earlyWarning,  setEarlyWarning,
    warningRadius, setWarningRadius,
    alarmSound,    setAlarmSound,
    vibration,     setVibration,
  };
}