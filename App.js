import { StatusBar } from "expo-status-bar";
import {View,Text,StyleSheet,SafeAreaView} from 'react-native';
import AppNavigation from "./navigation/appNavigation";
import './global.css';

export default function App(){
  return(
    <AppNavigation />
  )
}