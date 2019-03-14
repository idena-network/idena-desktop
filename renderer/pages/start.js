import {Component} from 'react'
import {FlipEditor} from '../components/flips'

export default class extends Component {
  render() {
    return (
      <main>
        <nav>
          <div>
            <img src="./static/logo.svg" />
          </div>
          <menu>
            <li className="accent">Aleksandr</li>
            <li>Settings</li>
          </menu>
          <menu>
            <li>Contacts</li>
            <li>Chats</li>
            <li>Wallets</li>
            <li className="active">My Idena</li>
          </menu>
        </nav>
        <div>
          <FlipEditor />
        </div>
        <style jsx global>{`
          html {
            font-size: 14px;
          }
          body {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', Helvetica, Arial,
              sans-serif;
            font-size: 1rem;
            margin: 0;
            padding: 0;
          }
          html,
          body,
          body > div {
            height: 100%;
          }
        `}</style>
        <style jsx>{`
          main {
            display: flex;
            padding: 0;
            margin: 0;
            height: 100%;
          }
          h1 {
            font-size: 1.6em;
          }

          nav {
            background: rgb(83, 86, 92);
            color: white;
            padding: 2em;
            width: 150px;
            text-align: center;
          }
          menu {
            padding: 0;
            margin: 3em 0;
            text-align: left;
          }

          li {
            color: rgba(255, 255, 255, 0.5);
            list-style-type: none;
            margin: 0 0 0.5em;
            padding: 0.5em 1em;
          }

          li.active {
            background: rgba(255, 255, 255, 0.1);
            color: rgb(255, 255, 255);
            border-radius: 3pt;
          }

          li.accent {
            color: rgb(255, 255, 255);
          }

          img {
            width: 96px;
            -webkit-filter: invert(1);
            filter: invert(1);
          }
        `}</style>
      </main>
    )
  }
}
