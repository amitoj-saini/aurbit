import { appStateApi, locationApi } from "@/lib/api";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import appLog from "@/lib/logger";

const LOCATION_TASK = "background-location-update";
const MIN_BACKGROUND_UPDATE_INTERVAL_MS = 5 * 60 * 60 * 1000;

async function updateLocation(location: Location.LocationObject) {
    console.log(location.coords)
    try {
        const response = await locationApi.update({
            longitude: location.coords.longitude,
            latitude: location.coords.latitude,
            speed: location.coords.speed || null,
        });

        await appLog("location", "Location Update response:", response.err || response.data);
    } catch (err) {
        await appLog("location", "Failed sending location:", err);
    }
}

TaskManager.defineTask(
    LOCATION_TASK,
    async ({ data, error }) => {
        if (error) {
            await appLog("location", "Location task error:", error);
            return;
        }

        if (!data) return;

        const { locations } = data as {
            locations: Location.LocationObject[];
        };

        if (!locations || locations.length === 0) {
            return;
        }

        await updateLocation(locations[0]);
    }
);


export async function initializeLocationUpdater() {
    try {
        // Check login state
        const response = await appStateApi.getAppState();

        if (response.err || !response.data || !response.data.loggedin) return;


        // Permissions
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

        if (foregroundStatus !== "granted") {
            await appLog("location", "Foreground permission denied");
            return;
        }


        const { status: backgroundStatus } =
            await Location.requestBackgroundPermissionsAsync();

        if (backgroundStatus !== "granted") {
            await appLog("location", "Background permission denied");
            return;
        }


        // always update when you open up the app
        let currentLocation = await Location.getCurrentPositionAsync();

        if (!currentLocation) 
            currentLocation = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Balanced});
        

        await updateLocation(currentLocation);


        const isStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);

        if (!isStarted) {
            await Location.startLocationUpdatesAsync(
                LOCATION_TASK,
                {
                    accuracy: Location.Accuracy.Balanced,
                    distanceInterval: 50,
                    // Make sure the background task still reports at least once every 5 hours
                    // even when the device isn't moving enough to trigger the normal update.
                    timeInterval: MIN_BACKGROUND_UPDATE_INTERVAL_MS,
                    deferredUpdatesInterval: MIN_BACKGROUND_UPDATE_INTERVAL_MS,
                    pausesUpdatesAutomatically: true,
                    activityType:
                        Location.ActivityType.AutomotiveNavigation,
                }
            );

            await appLog("location", "Background location started");
        }

    } catch (err) {
        await appLog("location", "Location updater initialization failed:", err);
    }
}