import React from 'react';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import logo from './logo.png'

class App extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      text: '',
      notification: '',
      notificationLevel: 'info',
      listening: false
    }

    // Globally set recognition object with initial value as null
    this.recognition = null

    // Create Reference for required elements
    this.formInput = React.createRef()
    this.notificationBlock = React.createRef()

    // Bind this for required function
    this.onResult = this.onResult.bind(this)
    this.onHandleChange = this.onHandleChange.bind(this)
  }

  componentDidMount() {
    try {
      /**
      * Get the SpeechRecognition || webkitSpeechRecognition API & initiate it
      *
      * NOTE: As of now, SpeechRecognition is only working on Google chrome. See
      * more details on below link
      * https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
      *
      */
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.onresult = this.onResult
    }
    catch(e) {
      this.notify('danger', 'Unable to start SpeechRecognition. Please try in Google Chrome', false)
    }
  }

  // Initiate the voice recognition
  startListen() {
    try {
      this.recognition.start()
      this.setState({ listening: true })
      this.notify('info', 'Started Listening')
    } catch {
      this.notify('danger', 'Unable to start SpeechRecognition. Please try in Google Chrome', false)
    }
  }

  // Stop the voice recognition
  onStop() {
    try {
        this.recognition.stop()
        this.setState({ listening: false })
        this.notify('info', 'Stopped Listening')
    } catch {
        this.notify('danger', 'Unable to stop Listening')
    }
  }

  // Capture & store the spoken sentence/words
  onResult(event){
    const results = event && event.results ? [ ...event.results ] : []
    const text = results.reduce((acc, speech) => acc + ' ' + speech[0].transcript, '')
    this.setState({ text: text })
  }

  //
  onSpeakOut() {
    // Stop the listening
    try {
      this.recognition.stop()
      this.setState({ listening: false })
    } catch {
      this.notify('danger', 'Unable to listening and speakout the text')
    }

    // Speakout the text
    try {
      const speech = new SpeechSynthesisUtterance()
      speech.text = this.state.text
    	speech.volume = 1
    	speech.rate = 1
    	speech.pitch = 1
      window.speechSynthesis.speak(speech);
    } catch {
      this.notify('danger', 'Unable to speak out')
    }
  }

  onHandleChange(e){
    this.setState({ text: e.target.value })
  }

  onCopy() {
    this.formInput.current.select()
    document.execCommand('copy')
    this.notify('info', 'Text Copied')
  }

  onClear() {
    this.setState({ text: ''})
  }

  notify(level, message, clear = true) {
    this.setState({ notification: message, notificationLevel: level })
    if(clear){
      setTimeout(() => {
        this.setState({ notification: '', notificationLevel: 'info' })
      }, 5000)
    }
  }

  render() {
    const { text, notification, notificationLevel, listening } = this.state
    return (
      <div className='container app-main'>
        <h1><img alt='' className='brand-logo' src={logo}/>Speech Recognition</h1><br/>
        <input placeholder='Start speaking by pressing Listen button' ref={this.formInput} onChange={this.onHandleChange} type='text' value={text} className='form-control' name='inputs' /> <br/>
        <div className='row'>
          <div className='col-md-2'>
            <div className='form-group actionBtns'>
              <button disabled={listening} className='btn btn-primary float-left' onClick={() => this.startListen()} type='button'>Listen</button>
              <button disabled={!listening} className='btn btn-secondary float-left' onClick={() => this.onStop()} type='button'>Stop</button>
            </div>
          </div>
          <div className='col-md-7'>
            {notification && <div ref={this.notificationBlock} className={`alert alert-${notificationLevel}`} role="alert">
              { notification }
            </div>}
          </div>
          <div className='col-md-3'>
            <div className='form-group actionBtns'>
              <button disabled={text.length <= 0} className='btn btn-light float-right' onClick={() => this.onClear()} type='button'>Clear</button>
              <button disabled={text.length <= 0} className='btn btn-light float-right' onClick={() => this.onCopy()} type='button'>Copy</button>
              <button disabled={text.length <= 0} className='btn btn-secondary float-right' onClick={() => this.onSpeakOut()} type='button'>Speakout</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App;
