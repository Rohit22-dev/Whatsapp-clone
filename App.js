import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Navigator from "./src/navigation";
import { Amplify, Auth, API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react-native";
import awsconfig from "./src/aws-exports";
import { useEffect } from "react";
import { getUser } from "./src/graphql/queries";
import { createUser } from "./src/graphql/mutations";

Amplify.configure({ ...awsconfig, Analytics: { disabled: true } });

const App = () => {
  useEffect(() => {
    const syncUser = async () => {
      //get auth user
      const authUser = await Auth.currentAuthenticatedUser({
        bypassCache: true,
      });
      // console.log(authUser);

      //query the database using Auth user id
      const userData = await API.graphql(
        graphqlOperation(getUser, { id: authUser.attributes.sub })
      );
      console.log(userData);

      if (userData.data.getUser) {
        console.log("User already exist in DB");
        return;
      }

      //if there is no user in db, create one
      const newUser = {
        id: authUser.attributes.sub,
        status: "Hey, i am using WhatsApp",
        name: authUser.attributes.phone_number,
      };
      const newUserResponse = await API.graphql(
        graphqlOperation(createUser, { input: newUser })
      );
    };
    syncUser();
  }, []);

  return (
    <View style={styles.container}>
      <Navigator />
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "whitesmoke",
    justifyContent: "center",
    // paddingVertical: 20,
  },
});

export default withAuthenticator(App);
