import * as TaskManager from 'expo-task-manager';


export const LOCATION_TASK_NAME = 'background-location-task';


export const defineBackgroundTask = () => {
  TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {

    if (error) {
      console.error(error);
      return;
    }
    if (data) {
      const { locations } = data;
      const { latitude, longitude } = locations[0].coords;
      

      // We can add the distance check here
      console.log("Background Ping:", latitude, longitude);
    }
  });
};