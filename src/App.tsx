import { observer } from 'mobx-react';
import { Route, Redirect } from 'react-router-dom';
import {
  TailwindContextValue,
  TailwindContext,
  TailwindBlockContext,
  defaultContext,
} from '@flumens';
import { IonApp, IonRouterOutlet, isPlatform } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import 'common/theme.scss';
import Home from './Home';
import Info from './Info/router';
import Survey from './Survey/router';
import User from './User/router';

const platform = isPlatform('ios') ? 'ios' : 'android';
const tailwindContext: TailwindContextValue = { platform };
const tailwindBlockContext = {
  ...defaultContext,
  ...tailwindContext,
  basePath: '',
};

const HomeRedirect = () => <Redirect to="home" />;

const App = () => (
  <IonApp>
    <TailwindContext.Provider value={tailwindContext}>
      <TailwindBlockContext.Provider value={tailwindBlockContext}>
        <IonReactRouter>
          <IonRouterOutlet id="main">
            <Route exact path="/" component={HomeRedirect} />
            <Route path="/home" component={Home} />
            {User}
            {Info}
            {Survey}
          </IonRouterOutlet>
        </IonReactRouter>
      </TailwindBlockContext.Provider>
    </TailwindContext.Provider>
  </IonApp>
);

export default observer(App);
