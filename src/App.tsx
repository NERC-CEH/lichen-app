import { observer } from 'mobx-react';
import { Route, Redirect } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './Home';
import Info from './Info/router';
import Survey from './Survey/router';

const HomeRedirect = () => <Redirect to="home" />;

const App = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet id="main">
        <Route exact path="/" component={HomeRedirect} />
        <Route path="/home" component={Home} />
        {Info}
        {Survey}
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default observer(App);
