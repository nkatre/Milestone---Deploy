var StatusModel = function(clients) {
    var self = this;
    self.clients = ko.observableArray();

    self.addClient = function(client) {
        self.clients.push(
            new ClientModel(client)
        );
    };
 
    self.removeClient = function(client) {
        self.clients.remove(client);
    };
 
    self.updateClient = function(person) 
    {
        for(var i = 0 ; i < self.clients().length ; i++)
        {
            var koObj = self.clients()[i];
            //console.log( koObj.name() )
            if(self.clients()[i].name() === person.name)
            {
                koObj.cpu(person.cpu);
                koObj.memoryLoad(person.memoryLoad);
		        koObj.testResult(person.testResult);
                koObj.nodes([]);
                for( var j = 0; j < person.nodes.length ; j++ )
                {
                    koObj.nodes.push( new NodeModel(person.nodes[j]) );
                }
                break;
            }
        }
    };

    // initialize first time.
    for( var i = 0; i < clients.length; i++)
    {
        self.addClient( clients[i] );
    }
};

var ClientModel = function(client)
{
    var self = this;
    self.cpu = ko.observable(client.cpu);
    self.memoryLoad = ko.observable(client.memoryLoad);
    self.name = ko.observable(client.name);
    self.alertNums = ko.observable(client.alertNums);
    self.faultNums = ko.observable(client.faultNums);
    self.nodes = ko.observableArray([]);

    // init
    for( var i = 0; i < client.nodes.length; i++ )
    {
        self.nodes.push( new NodeModel(client.nodes[i]) );
    }
}

var NodeModel = function(node) {
    var self = this;
    self.color = ko.observable(node.color);
};

 
var viewModel = new StatusModel(
[
    { 
	    name: "Fake Client", cpu: "50", memoryLoad: "100", alertNums: "50", faultNums: "50",
        nodes: 
        [
            {color:"#00ff00"},
            {color:"#cccc00"},
            {color:"#cccc00"}
        ]
    },
    { 
	    name: "Your Computer", cpu: "0.00", memoryLoad: "0", alertNums: "0", faultNums: "0",
        nodes: 
        [
            {color:"#ab3fdd"},
            {color:"#ab3fdd"},
            {color:"#ab3fdd"}
        ]
    }
]);


$(document).ready( function()
{
    ko.applyBindings(viewModel);
    $('#statusTable').DataTable( { "paging":   false, "info":     false });

    var socket = io.connect('http://52.5.33.235:5003');

    socket.on("heartbeat", function(client) 
    {
        console.log(JSON.stringify(client));
        viewModel.updateClient( 
        {
            name:client.name, 
            cpu:client.cpu, 
            memoryLoad: client.memoryLoad,
            alertNums: client.alertNums,
            faultNums: client.faultNums,
            nodes:client.nodes 
        });
    });
}); 
