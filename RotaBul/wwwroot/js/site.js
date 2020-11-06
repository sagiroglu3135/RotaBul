// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.


//Faydalanılan Linklerden bazıları comment-line olarak aşağıdaki kod blokları arasında da belirtilmiştir.

//Global Variables
var map;
var routeType = "DRIVING";
var markers = [];
var circle;
var directionsService;
var directionsDisplay;
var jsonArrayData = [];
var mRootMarker;
function initMap()// Haritayı ayaklandırmak için method
{


	directionsService = new google.maps.DirectionsService();//Rota bulmak için Google'ın sağladığı servisler.
	directionsDisplay = new google.maps.DirectionsRenderer();

	//Default olarak İzmir'de herhangi bir koordinatta ve belirtilen zoom ile bir harita nesnesi oluşturuluyor.
	map = new google.maps.Map(document.getElementById('map'), {
		center: { lat: 38.5456, lng: 27.154 },
		zoom: 6,
		gestureHandling: "cooperative"
	});

	if (document.title.toLocaleLowerCase().includes("konumnüfus")) {

		addRootMarker();

		var text3Input = document.getElementById("Text3");
		text3Input.addEventListener('change', function (evt) {
			//var lat = document.getElementById("Text1").value;
			//var lng = document.getElementById("Text2").value;
			var lat = mRootMarker.getPosition().lat();
			var lng = mRootMarker.getPosition().lng();

			circle.setMap(null);
			addCircle(lat, lng);

		});


	}
	else {
		//Haritaya tıklandığında bir marker nesnesi koyabilmemizi sağlayan kod parçacığı.
		google.maps.event.addListener(map, 'click', function (event) {
			var marker = new google.maps.Marker({
				position: event.latLng,
				map: map
			});

			markers.push(marker);// markerları aynı zamanda bir dizi içerisinde tutuyoruz.
		});
	}

	directionsDisplay.setMap(map);//DirectionDisplay nesnesi haritaya set ediliyor.

}

function updateRouteType()// Haritada seyahat tipi değişirse tetiklenecek method.
{
	routeType = document.getElementById("seyahatTipi").value;
}

function rotalariGetir() {
	var request = { travelMode: google.maps.TravelMode[routeType] };//bir istek ayaklandırılıyor. Gerekli diğer parametreleri aşağıda doldurulacak.

	for (var i = 0; i <= markers.length - 1; i++) {
		//Çoklu markerlarda rota bulma işlemini nasıl yapabileceğimiz konusunda bize yardımcı olan link
		//https://stackoverflow.com/questions/36523773/how-to-make-route-direction-between-multiple-markers 
		if (i == 0) {
			request.origin = markers[i].position;
		}
		else if (i == (markers.length - 1)) {
			request.destination = markers[i].position;
		}
		else {
			if (!request.waypoints) request.waypoints = [];
			request.waypoints.push({
				location: markers[i].getPosition(),
				stopover: true
			});
		}
	}

	//request hazır hale geldikten sonra istek yollanır.
	directionsService.route(request, function (result, status) {
		if (status == google.maps.DirectionsStatus.OK)//Gelen cevap durumu OK ise 
		{
			directionsDisplay.setDirections(result);//response haritaya set edilir.

			markerlariSil();//Bizim oluşturduğumuz markerları siliyoruz,(Çirkin bir görüntü olmasın diye)


			//Faydalanılan linkler
			//https://www.w3schools.com/jsref/met_table_insertrow.asp 
			//https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_table_insertrow
			var table = document.getElementById("tablo");
			table.innerHTML += "<table border='1' id='tablocuk'>";

			var length = result.routes[0].legs.length;
			var table = document.getElementById("tablocuk");

			for (var i = 0; i < length; i++) {
				//Kendi oluşturduğumuz bir json objesi içerisine istenilen bilgileri kaydediyoruz.
				var data = '{';

				var row = table.insertRow(i);
				var cell1 = row.insertCell(0);
				var cell2 = row.insertCell(1);
				var cell3 = row.insertCell(2);

				var r = JSON.stringify(result.routes[0].legs[i].start_address);
				cell1.innerHTML = r;
				data += '"baslangicAdresi":' + r + ",";

				r = JSON.stringify(result.routes[0].legs[i].end_address);
				cell2.innerHTML = r;
				data += '"bitisAdresi":' + r + ",";

				r = JSON.stringify(result.routes[0].legs[i].distance.text);
				cell3.innerHTML = result.routes[0].legs[i].distance.text;
				data += '"uzaklik":' + r + "}";

				//alert(data);
				jsonArrayData.push(data);// her bir objeyi yine bir dizide saklıyoruz.

			}


			//Tablomuza başlıkların eklendiği bölüm.
			var table = document.getElementById("tablocuk");
			var row = table.insertRow(0);
			var cell1 = row.insertCell(0);
			var cell2 = row.insertCell(1);
			var cell3 = row.insertCell(2);
			cell1.innerHTML = "<center><strong>Başlangıç Adresi</strong></center>";
			cell2.innerHTML = "<center><strong>Bitiş Adresi</strong></center>";
			cell3.innerHTML = "<center><strong>Uzaklık</strong></center>";

			createFile();//oluşturulan json objelerimizin dosyaya yazılmadan önceki son halini alacağı method çağırılıyor.

		}
		else {
			alert("Belirtilen konumlar arasında rota bulunamadı");//Status  OK değilse Rota bulunamadı mesajı verilsin.
			markerlariSil();
			markers = [];
		}
	});

}

function markerlariSil() {

	//delete marker icons on the map
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	//if (circle != null) circle.setMap(null);
	markers = [];//clear markers array.
}

function createFile() {
	//Dosya oluşturup kaydedebilmek için faydalandığımız link.
	//https://stackoverflow.com/questions/13405129/javascript-create-and-save-file

	var text = '{"rotalar":[';
	for (var i = 0; i < jsonArrayData.length; i++) {
		text += jsonArrayData[i] + ',';
	}
	text += ']}';


	var link = document.getElementById("hiddenLink");
	link.hidden = false;//Dosya oluşturulduysa linki aktif hale getirelim.
	download(text, 'rotalar.json', 'json');

}

function download(text, name, type) {
	var a = document.getElementById("a");
	var file = new Blob([text], { type: type });
	a.href = URL.createObjectURL(file);
	a.download = name;
}




function addRootMarker() {

	var lat;
	var lng;
	if (mRootMarker == null) {
		var marker = new google.maps.Marker({
			center: map.center,
			map: map,
			draggable: true,
			position: map.center,
		});
		mRootMarker = marker;
	}

	lat = mRootMarker.getPosition().lat();
	lng = mRootMarker.getPosition().lng();
	//alert(lat + " " + lng);
	addCircle(lat, lng);

	lat = lat.toFixed(5);
	Text1.value = lat;
	lng = lng.toFixed(5);
	Text2.value = lng;

	setDraggableEventListener(mRootMarker);


}



function setDraggableEventListener(marker) {
	google.maps.event.addListener(
		marker,
		'drag',
		function (event) {

		});


	google.maps.event.addListener(marker, 'dragend', function (event) {

		circle.setMap(null);
		addCircle(this.position.lat(), this.position.lng());
		var lat = this.position.lat();
		var lng = this.position.lng();

		var marker = new google.maps.Marker({

			draggable: true,
			position: { lat, lng },
		});

		mRootMarker = marker;
		//alert(mRootMarker.getPosition().lat() + " " + mRootMarker.getPosition().lng());
		//console.log(rootMarker.getPosition());
		lat = lat.toFixed(5);
		Text1.value = lat;
		lng = lng.toFixed(5);
		Text2.value = lng;
	});
}

function addCircle(lat, lng) {

	var textInput = document.getElementById("Text3").value;
	//alert(textInput);
	if (textInput != "") {

		const cityCircle = new google.maps.Circle({
			strokeColor: "#000000",
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: "#CF7C29",
			fillOpacity: 0.35,
			map,
			center: { lat, lng },
			radius: textInput * 1000,// m -> km dönüşümü
		});
		circle = cityCircle;
	}
}



function markerlariEkle() {

	//İlgili Parametrelere göre url oluturuluyor ve response talep ediliyor
	var xKoordinati = document.getElementById("Text1").value;
	var yKoordinati = document.getElementById("Text2").value;
	var yaricap = document.getElementById("Text3").value;
	var populasyon = document.getElementById("Text4").value;
	var Url = 'https://earthquake.usgs.gov/ws/geoserve/places.json?latitude=' + xKoordinati + '&longitude=' + yKoordinati + '&maxradiuskm=' + yaricap + '&minpopulation=' + populasyon + '&type=geonames';


	if (xKoordinati != "" && yKoordinati != "" && yaricap != "" && populasyon != "") {
		//alert(Url);

		$.ajax({

			url: Url,
			type: "GET",
			success: function (result) {
				//GeoJSON verileri haritaya ekleniyor

				start = markers.length;
				result.geonames.features.forEach(function infoWindow(Feature) {

					var infowindow = new google.maps.InfoWindow({
						content: '<p>' + Feature.properties.name + " - Nüfus: " + Feature.properties.population + '</p>'
					});

					var _lat = Feature.geometry.coordinates[1];
					var _lng = Feature.geometry.coordinates[0];
					var uluru = { lat: _lat, lng: _lng };

					var marker = new google.maps.Marker({
						position: uluru,

						title: JSON.stringify(Feature.properties.name + " - Nüfus: " + Feature.properties.population)
					});
					marker.addListener('click', function () {
						infowindow.open(map, marker);
					});
					markers.push(marker);

				});
				gosterr();

				//inputlar temizleniyor
				//for (var i = 1; i <= 4; i++) {
				//	$("#" + "Text" + i).val("");
				//		}

			}, error: function (error) {
				alert("Bir Hata Oluştu! Tekrar Deneyiniz.");

			}
		});

	}//end of if condition
	else {
		alert("Parametreleri Doğru Bir Şekilde Doldurduğunuzdan Emin Olunuz!");
	}

}

function gosterr() {

	if (markers.length == 0) {
		alert("Yerleşim yeri bulunamadı. Parametreleri değiştirip tekrar deneyiniz.");
	} else {
		for (var i = start; i < markers.length; i++) {
			markers[i].setMap(map);
		}


	}
}

