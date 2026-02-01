import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

import {HttpClient, HttpResponse} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: signalR.HubConnection;

  constructor(private http: HttpClient) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/gameHub', {
      //.withUrl('http://57.129.71.128:5000/gameHub', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();

    this.hubConnection.start().catch(err => console.log('Error while starting connection: ' + err));
  }

  get connection(): signalR.HubConnection {
    return this.hubConnection;
  }

}
