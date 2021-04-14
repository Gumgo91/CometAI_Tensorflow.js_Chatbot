// 텐서플로우
function tf_function(sen) {
	sen = sen.replace('&#x27;','');
	sen = sen.replace('&#x27;','');
	sen = sen.replace('[','');
	sen = sen.replace(']','');
	var senSplit = sen.split(' ');
	const data = [
		...senSplit.map(w => word_to_index[w] ? word_to_index[w] : 3),
		...new Array(30).fill(0),
	].slice(0, 30);
	
	encoder_model.then(function (res) {
		var prediction = res.predict(tf.tensor([data]));
		//prediction[0].print();
		//prediction[1].print();
		decoder_model.then(function (res2) {
			var prediction2 = res2.predict( [ tf.tensor([[1]]), tf.tensor( prediction[0].arraySync() ), tf.tensor( prediction[1].arraySync() ) ] );
			var index = prediction2[0].flatten().argMax().dataSync()[0];
			var output = index_to_word[index];
			var n = 1;
			while (true) {
				var state_h = prediction2[1].arraySync();
				var state_c = prediction2[2].arraySync();
				var prediction2 = res2.predict( [ tf.tensor([[index]]), tf.tensor( state_h ), tf.tensor( state_c ) ] );
				var index = prediction2[0].flatten().argMax().dataSync()[0];
				if(index==2 || n>10){
					recieve({'senderName':'혜성','message':output});
					break;
				}
				else{
					output = output + ' ' + index_to_word[index];
				}
				n = n+1;
			}
		}, function (err2) {
	console.log('에러2');
	console.log(err2);
});
	}, function (err) {
	console.log('에러');
	console.log(err);
});
	
    }
function createMessageTag(LR_className, senderName, message) {
        let chatLi = $('div.chat.format ul li').clone();
        chatLi.addClass(LR_className);
        chatLi.find('.sender span').text(senderName);
        chatLi.find('.message span').text(message);
        return chatLi;
    }

function appendMessageTag(LR_className, senderName, message) {
        const chatLi = createMessageTag(LR_className, senderName, message);
        $('div.chat:not(.format) ul').append(chatLi);
        $('div.chat').scrollTop($('div.chat').prop('scrollHeight'));
}

function send(sentence){
	$.ajax({
		type: "POST",
		url: 'http://gumgo91.pythonanywhere.com/kop/',
		dataType: "json",
		data:{"sen":sentence},
		success :  function(resp){
            tf_function(resp.responseText);},

error :  function(resp){
            tf_function(resp.responseText);}
});	
}

function recieve(data) {
        //const LR = (data.senderName != myName)? "left" : "right";
        appendMessageTag("left", data.senderName, data.message);
    }


const Chat = (function(){
    const myName = "blue";
 
    // init 함수
    function init() {
        // enter 키 이벤트
        $(document).on('keydown', 'div.input-div textarea', function(e){
            if(e.keyCode == 13 && !e.shiftKey) {
                e.preventDefault();
                const message = $(this).val();
 
                // 메시지 전송
                sendMessage(message);
                // 입력창 clear
                clearTextarea();
            }
        });
    }
 
    // 메세지 태그 생성
    function createMessageTag(LR_className, senderName, message) {
        // 형식 가져오기
        let chatLi = $('div.chat.format ul li').clone();
 
        // 값 채우기
        chatLi.addClass(LR_className);
        chatLi.find('.sender span').text(senderName);
        chatLi.find('.message span').text(message);
 
        return chatLi;
    }
 
    // 메세지 태그 append
    function appendMessageTag(LR_className, senderName, message) {
        const chatLi = createMessageTag(LR_className, senderName, message);
 
        $('div.chat:not(.format) ul').append(chatLi);
 
        // 스크롤바 아래 고정
        $('div.chat').scrollTop($('div.chat').prop('scrollHeight'));
    }
 
    // 메세지 전송
    function sendMessage(message) {
        // 서버에 전송하는 코드로 후에 대체
        const data = {
            "senderName"    : "나",
            "message"        : message
        };
 
        // 통신하는 기능이 없으므로 여기서 receive
        resive(data);
	send(message);
    }
 
    // 메세지 입력박스 내용 지우기
    function clearTextarea() {
        $('div.input-div textarea').val('');
    }
 
    // 메세지 수신
    function resive(data) {
        const LR = (data.senderName != myName)? "left" : "right";
        appendMessageTag("right", data.senderName, data.message);
    }
 
    return {
        'init': init
    };
})();

$(function(){
    Chat.init();
});