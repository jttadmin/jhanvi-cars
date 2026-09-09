package com.bangalorecabbookingapp

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.google.android.gms.maps.model.LatLng
import com.google.android.libraries.places.api.Places
import com.google.android.libraries.places.api.model.AutocompletePrediction
import com.google.android.libraries.places.api.model.Place
import com.google.android.libraries.places.api.model.kotlin.rectangularBounds
import com.google.android.libraries.places.api.net.FetchPlaceRequest
import com.google.android.libraries.places.api.net.FindAutocompletePredictionsRequest
import com.google.android.libraries.places.api.net.PlacesClient

class PlacesModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private val placesClient: PlacesClient =
        Places.createClient(reactContext)

    override fun getName(): String {
        return "PlacesModule"
    }

    @ReactMethod
    fun searchPlaces(
        query: String,
        latitude: Double,
        longitude: Double,
        promise: Promise
    ) {
        if (query.trim().length < 2) {
            promise.resolve(Arguments.createArray())
            return
        }

        val southwest = LatLng(
            latitude - 0.5,
            longitude - 0.5
        )

        val northeast = LatLng(
            latitude + 0.5,
            longitude + 0.5
        )

        val bounds = rectangularBounds(
            southwest,
            northeast
        )

        val request =
            FindAutocompletePredictionsRequest.builder()
                .setQuery(query)
                .setLocationBias(bounds)
                .setCountries(listOf("IN"))
                .build()

        placesClient
            .findAutocompletePredictions(request)
            .addOnSuccessListener { response ->

                val results: WritableArray = Arguments.createArray()

                response.autocompletePredictions.forEach {
                    prediction: AutocompletePrediction ->

                    val result: WritableMap = Arguments.createMap()

                    result.putString(
                        "placeId",
                        prediction.placeId
                    )

                    result.putString(
                        "primaryText",
                        prediction.getPrimaryText(null).toString()
                    )

                    result.putString(
                        "secondaryText",
                        prediction.getSecondaryText(null).toString()
                    )

                    result.putString(
                        "description",
                        prediction.getFullText(null).toString()
                    )

                    results.pushMap(result)
                }

                promise.resolve(results)
            }
            .addOnFailureListener { exception ->

                Log.e(
                    "PlacesModule",
                    "searchPlaces failed: ${exception.javaClass.name}: ${exception.message}",
                    exception
                )

                promise.reject(
                    "PLACES_SEARCH_ERROR",
                    exception.message,
                    exception
                )
            }
    }

    @ReactMethod
    fun getPlaceDetails(
        placeId: String,
        promise: Promise
    ) {
        val placeFields = listOf(
            Place.Field.ID,
            Place.Field.DISPLAY_NAME,
            Place.Field.FORMATTED_ADDRESS,
            Place.Field.LOCATION
        )

        val request = FetchPlaceRequest.newInstance(
            placeId,
            placeFields
        )

        placesClient
            .fetchPlace(request)
            .addOnSuccessListener { response ->

                val place = response.place
                val location = place.location

                if (location == null) {
                    promise.reject(
                        "PLACE_LOCATION_ERROR",
                        "Selected place does not have a location."
                    )
                    return@addOnSuccessListener
                }

                val result: WritableMap = Arguments.createMap()

                result.putString(
                    "placeId",
                    place.id ?: ""
                )

                result.putString(
                    "name",
                    place.displayName?.toString() ?: ""
                )

                result.putString(
                    "address",
                    place.formattedAddress ?: ""
                )

                result.putDouble(
                    "latitude",
                    location.latitude
                )

                result.putDouble(
                    "longitude",
                    location.longitude
                )

                promise.resolve(result)
            }
            .addOnFailureListener { exception ->

                Log.e(
                    "PlacesModule",
                    "getPlaceDetails failed: ${exception.javaClass.name}: ${exception.message}",
                    exception
                )

                promise.reject(
                    "PLACE_DETAILS_ERROR",
                    exception.message,
                    exception
                )
            }
    }
}
