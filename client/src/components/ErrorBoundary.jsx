import { Component } from 'react';
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message };
  }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>😵 משהו השתבש</h2>
          <p>אירעה שגיאה לא צפויה. נסה לרענן את הדף.</p>
          <button className="add-btn" onClick={() => window.location.reload()}>
            רענן דף
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;