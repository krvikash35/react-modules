import React from 'react';

import RoutingContext, { TRouterContextState } from './Context';

export default class RoutingProvider extends React.Component<{}, TRouterContextState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      currentPath: window.location.pathname,
      navigate: this.navigate
    };
  }
  componentDidMount() {
    window.addEventListener('popstate', this.handlePopState);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopState);
  }

  handlePopState = () => {
    this.setState({ currentPath: window.location.pathname });
  };

  navigate = (pathname: string) => {
    if (pathname === this.state.currentPath) return;
    this.setState({
      currentPath: pathname
    });
    window.history.pushState(null, '', pathname);
  };

  render() {
    return (
      <RoutingContext.Provider value={this.state}>
        {this.props.children}
      </RoutingContext.Provider>
    );
  }
}

