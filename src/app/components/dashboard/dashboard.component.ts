import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public isMobile: boolean;

  public conversacionesPrueba: any;
  public msgStack: any;
  public msgStackKeys: any;
  public conversacionActual: number;

  public idMiUsuario: number = 1;

  public input: any;
  public formMessage: FormGroup;

  public fakeMsgId = 0;

  constructor() {
    this.formMessage = new FormGroup({
      cvnFilter: new FormControl(null, null),
      message: new FormControl(null, null)
    });

    this.conversacionesPrueba = require('src/app/utils/auxiliaresBaseDeDatos/usuariosPrueba.json');
    this.conversacionActual = -1;
    this.msgStack = {};
    this.input = document.getElementById('input')

    for (let i = 0; i < 1; i++) {
      for (const cvn of this.conversacionesPrueba) {
        this.msgStack[(cvn.usu_id + i).toString()] = {
          id: (cvn.usu_id + i),
          nombre: cvn.usu_desc + ' ' + i,
          cargo: cvn.usu_rol,
          pic: cvn.usu_img,
          ultimoMsg: cvn.ultimo_msg,
          ultimoUsuario: cvn.ultimoUsuario,
          newMsgCount: cvn.newMsgCount,
          lastInt: new Date(), 
          msg: []
        };

        // Provisional
        for (let j = 0; j < 50; j++) {
          this.msgStack[(cvn.usu_id + i).toString()].msg.push(
            {
              id: this.fakeMsgId++,
              usu_pk_id: Math.round(Math.random() * 100) % 2 == 0 ? 1 : 2,
              body: this.makeRandom(),
              date: new Date(),
              sending: false,
              sended: Math.round(Math.random() * 100) % 2 == 0 ? true : false,
              readed: true
            }
          );
        }

        this.msgStackKeys = this.getMsgStackKeys();
      }
    }

    this.detectMob();
    this.ordernarConversacionesPorFecha();
  }

  get f () {
    return this.formMessage.controls;
  }

  public detectMob() {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];
    
    this.isMobile = toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
    });
  }

  ngOnInit(): void {
  }

  cargarConversacion(id: number) {
    this.conversacionActual = id;

    this.confimarLecturaMsg();

    setTimeout(() => {
      const element = document.getElementById('msg-stack')!;
      element.scrollTop = element.scrollHeight;
    });
  }

  cerrarConversacion() {
    this.conversacionActual = -1;
  }


  enviarNuevoMsg() {
    if (this.f['message'].value.length > 0) {
      let idMsg = this.fakeMsgId++;

      this.msgStack[this.conversacionActual].lastInt = new Date();

      this.msgStack[this.conversacionActual].msg.push(
        {
          id: idMsg,
          usu_pk_id: 1,
          body: this.f['message'].value.toString(),
          date: new Date(),
          sending: true,
          sended: Math.round(Math.random() * 100) % 2 == 0 ? true : false
        }
      );

      this.f['message'].setValue('');
      this.msgStack[this.conversacionActual].ultimoUsuario = 'Antonio Rico';

      this.ordernarConversacionesPorFecha();
      this.reproducirSonidoEnviandoMsg();

      setTimeout(() => {
        const element = document.getElementById('msg-stack')!;
        element.scrollTop = element.scrollHeight;
      });

      let msgIndex = this.msgStack[this.conversacionActual].msg.findIndex((msg: any) => msg.id == idMsg); 

      setTimeout(() => {
        this.msgStack[this.conversacionActual].msg[msgIndex].sending = false;
      }, 2000);
    }
  }

  reintentarEnvioMensaje(idMsg: number, sended: boolean) {
    if (!sended) {
      let msgIndex = this.msgStack[this.conversacionActual].msg.findIndex((msg: any) => msg.id == idMsg);
      this.msgStack[this.conversacionActual].msg[msgIndex].sending = true;

      setTimeout(() => {
        this.msgStack[this.conversacionActual].msg[msgIndex].sending = false;
        this.msgStack[this.conversacionActual].msg[msgIndex].sended = true;

        this.reproducirSonidoEnviandoMsg();
      }, 2000);
    }
  }

  private confimarLecturaMsg() {
    setTimeout(() => {
      this.msgStack[this.conversacionActual].newMsgCount = 0;
    }, 1000);

    setTimeout(() => {
      for (let i = this.msgStack[this.conversacionActual].msg.length - 1; i >= 0; i--) {
        if (!this.msgStack[this.conversacionActual].msg[i].readed) {
          this.msgStack[this.conversacionActual].msg[i].readed = true;
        } else {
          break;
        }
      }
    }, 4500);
  }

  filtrarConversaciones() {
   if (this.f['cvnFilter'].value !== null) {
      let lookFor = this.f['cvnFilter'].value.trim().split(' ');
      let filteredKeys = [];
      for (const key of this.getMsgStackKeys()) {
        let found = false;
        for (const word of lookFor) {
          if (this.msgStack[key].nombre.toUpperCase().search(word.toUpperCase()) != -1) {
            found = true;
            break; 
          }
        }
        if (found) {
          filteredKeys.push(key);
        }
      }
      this.msgStackKeys = filteredKeys;
    } else {
      this.msgStackKeys = this.getMsgStackKeys();
    }
  }

  private ordernarConversacionesPorFecha() {
    let sortable = [];

    for (let key in this.msgStack) {
        sortable.push([key, this.msgStack[key].lastInt]);
    }

    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });

    let sortedKeys = [];

    for (const obj of sortable) {
      sortedKeys.push(obj[0]);
    }

    this.msgStackKeys = sortedKeys;
  }

  fakeNewMessage() {
    let aux = this.getMsgStackKeys();
    let cvn = Math.floor(Math.random() * aux.length);

    this.msgStack[aux[cvn]].lastInt = new Date();

    this.msgStack[aux[cvn]].msg.push(
      {
        id: this.fakeMsgId++,
        usu_pk_id: 2,
        body: 'BEEP ' + this.makeRandom(),
        date: new Date(),
        sending: false,
        sended: Math.round(Math.random() * 100) % 2 == 0 ? true : false,
        readed: false
      }
    );

    this.msgStack[aux[cvn]].newMsgCount++;

    if (+aux[cvn] === +this.conversacionActual) {
      this.windowsScrollDown();
      this.confimarLecturaMsg();
    }

    this.ordernarConversacionesPorFecha();

    this.reproducirSonidoNuevoMsg();
  }

  getMsgStackKeys() {
    return Object.keys(this.msgStack)
  }

  windowsScrollDown() {
    setTimeout(() => {
      const element = document.getElementById('msg-stack')!;
      element.scrollTop = element.scrollHeight;

      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  reproducirSonidoNuevoMsg() {
    const audio = new Audio('assets/ok.wav');
    audio.play();
  }

  reproducirSonidoEnviandoMsg() {
    const audio = new Audio('assets/sended.wav');
    audio.play();
  }

  private makeRandom() {
    let possible = ['hola', 'mundo', 'prueba', 'de', 'nuevo', 'random', 'string', 'con', 'todos', 'los', 'caracteres', 'posibles', 'y', 'todos', 'los', 'numeros', 'posibles'];
    let text = '';
    let lengthOfCode = Math.floor(Math.random() * (20 - 5)) + 5;    

    for (let i = 0; i < lengthOfCode; i++) {
      let pos = Math.floor(Math.random() * (16 - 0)) + 0;
      text += possible[pos] + ' ';
    }
    
    return text;
  }
}
