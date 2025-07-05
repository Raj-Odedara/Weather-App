import { View, Text, SafeAreaView, Image, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState, useCallback, useEffect } from "react";
import { theme } from "../theme";
import { CalendarDaysIcon, MagnifyingGlassIcon } from "react-native-heroicons/outline"
import { MapPinIcon } from "react-native-heroicons/solid"
import { debounce } from 'lodash'
import { fetchLocations, fetchWeatherForecast } from "./api/weather";
import { weatherImages } from "../constants";
import * as progress from 'react-native-progress'
import { storeData, getData } from "../utils/asyncStorage";

export default function HomeScreen() {
    const [showSearch, toggleSearch] = useState(false);
    const [locations, setlocations] = useState([]);
    const [weather, setWeather] = useState({});
    const [lodaing, setLodaing] = useState(true)

    const handleLocation = (loc) => {
        setlocations([]);
        toggleSearch(false);
        setLodaing(true);
        fetchWeatherForecast({
            cityName: loc.name,
            days: '7'
        }).then(data => {
            setWeather(data);
            setLodaing(false);
            storeData('city', loc.name);
            // console.log('got forecast: ',data);
        })
    }
    const handleSearch = value => {
        //Fetch Locations
        if (value.length > 2) {
            fetchLocations({ cityName: value }).then(data => {
                setlocations(data);
            })
        }
    }
    useEffect(() => {
        fetchMyWeatherData();
    }, []);

    const fetchMyWeatherData = async () => {
        let myCity = await getData('city');
        let cityName = 'Mahiyari';
        if (myCity) cityName = myCity;

        fetchWeatherForecast({
            cityName,
            days: 7
        }).then(data => {
            setWeather(data);
            setLodaing(false)
        })
    }
    const handleTextDebounce = useCallback(debounce(handleSearch, 1200), [])
    const { current, location } = weather;
    // console.log(current?.condition?.text)
    return (
        <View className="flex-1 relative">
            <StatusBar style="light" />
            <Image blurRadius={70} source={require('../assets/images/bg.png')}
                className="absolute h-full w-full"
            />
            {
                lodaing ? (
                    <View className="flex-1 flex-row justify-center items-center">
                        <progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
                    </View>
                ) : (
                    <SafeAreaView className="flex flex-1">
                        {/* Search Section */}
                        <View style={{ height: '7%' }} className="mx-4 relative z-50">
                            <View className="flex-row justify-end items-center rounded-full"
                                style={{ backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent' }}>
                                {
                                    showSearch ? (
                                        <TextInput
                                            onChangeText={handleTextDebounce}
                                            placeholder='Search City'
                                            placeholderTextColor={'lightgray'}
                                            className="pl-6 h-10 pb-1 flex-1 text-xl text-white"
                                        />
                                    ) : null
                                }

                                <TouchableOpacity
                                    onPress={() => toggleSearch(!showSearch)}
                                    style={{ backgroundColor: theme.bgWhite(0.3) }}
                                    className="rounded-full p-3 m-1"
                                >
                                    <MagnifyingGlassIcon size="25" color="white" />
                                </TouchableOpacity>
                            </View>
                            {
                                locations.length > 0 && showSearch ? (
                                    <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                                        {
                                            locations.map((loc, index) => {
                                                let showBorder = index + 1 != locations.length;
                                                let borderClass = showBorder ? 'border-b-2 border-b-gray-400' : '';
                                                return (
                                                    <TouchableOpacity
                                                        onPress={() => handleLocation(loc)}
                                                        key={index}
                                                        className={"flex-row items-center border-0 p-3 px-4 mb-1 " + borderClass}
                                                    >
                                                        <MapPinIcon size="20" color="gray" />
                                                        <Text className="text-black text-lg ml-2">{loc?.name}, {loc?.region}, {loc?.country}</Text>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        }
                                    </View>
                                ) : null
                            }
                        </View>
                        {/* Forecast Section */}
                        <View className="mx-4 flex justify-around flex-1 mb-2">
                            {/* location */}
                            <Text className="text-white text-center text-4xl font-extrabold">
                                {location?.name + ","}
                                <Text className="text-2xl font-semibold text-gray-100"> {" " + location?.region}</Text>
                                <Text className="text-xl font-medium text-gray-300"> {", " + location?.country}</Text>
                            </Text>
                            <Text className="text-white text-center text-4xl font-extrabold">
                                {new Date(location?.localtime).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    hour12: true
                                })}

                            </Text>
                            {/* Weather Image */}
                            <View className="flex-row justify-center">
                                <Image
                                    source={weatherImages[current?.condition?.text]}
                                    className="w-52 h-52"
                                />

                            </View>
                            {/* Degree Celcius */}
                            <View className="space-y-2">
                                <Text className="text-center font-bold text-white text-6xl ml-5">
                                    {current?.temp_c}&#176;
                                </Text>
                                <Text className="text-center text-white text-xl tracking-widest">
                                    {current?.condition?.text}
                                </Text>
                            </View>
                            {/* Other Stats */}
                            <View className="flex-row justify-between items-center mx-4">
                                <View className="flex-row space-x-1 items-center">
                                    <Image source={require("../assets/icons/wind.png")} className="h-6 w-6 mr-2" />
                                    <Text className="text-white font-semibold text-base">
                                        {current?.wind_kph} Kph
                                    </Text>
                                </View>
                                <View className="flex-row space-x-1 items-center">
                                    <Image source={require("../assets/icons/drop.png")} className="h-6 w-6 mr-2" />
                                    <Text className="text-white font-semibold text-base">
                                        {current?.humidity}%
                                    </Text>
                                </View>
                                <View className="flex-row space-x-1 items-center">
                                    <Image source={require("../assets/icons/sun.png")} className="h-6 w-6 mr-2" />
                                    <Text className="text-white font-semibold text-base">
                                        {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                                    </Text>
                                </View>
                            </View>
                            {/* Forecast for next days */}
                            <View className="mb-2 space-y-3 ">
                                <View className="flex-row items-center mx-5 pb-4">
                                    <CalendarDaysIcon size="22" color="white" />
                                    <Text className="text-white text-base">Daily Forecast</Text>
                                </View>

                                <ScrollView
                                    horizontal
                                    contentContainerStyle={{ padding: 15 }}
                                    showsHorizontalScrollIndicator={false}
                                >
                                    {
                                        weather?.forecast?.forecastday?.map((item, index) => {
                                            let date = new Date(item.date);
                                            let options = { weekday: 'long' };
                                            let dayName = date.toLocaleDateString('en-US', options);
                                            dayName = dayName.split(',')[0];
                                            return (
                                                <View
                                                    key={index}
                                                    className="flex justify-center items-center w-25 rounded-3xl py-3  space-y-1 mr-4"
                                                    style={{ backgroundColor: theme.bgWhite(0.15),padding:17 }}
                                                >
                                                    <Image source={weatherImages[item?.day?.condition.text]}
                                                        className="h-11 w-11" />
                                                    <Text className="text-white m-2">{dayName}</Text>
                                                    <Text className="text-white text-xl font-semibold">
                                                        {item?.day?.avgtemp_c}&#176;
                                                    </Text>
                                                </View>)
                                        })
                                    }
                                </ScrollView>
                            </View>
                        </View>
                    </SafeAreaView>
                )
            }

        </View>
    )
}