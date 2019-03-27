import pylsl
import socketio
from socketIO_client import SocketIO
from sanic import Sanic
import threading
import time

from eeg_stream import EEGStream
from marker_stream import MarkerStream
from ml_stream import MLStream

from tests.test_marker_publisher import test_marker_stream, start_marker_stream


def on_retrieve_prediction_results(self, *args):
    sid=args[0]
    results=args[1]
    uuid, p300, score = results
    print(f'p300: {p300}')
    print(f'score: {score}')

def on_train_results(self, *args):
    sid=args[0]
    results=args[1]
    uuid, acc = results
    print(f'accuracy: {acc}')

class P300Client(object):

    def __init__(self):
        self.results = []
        self.socket_client = None
        self.marker_outlet = None
        self.train_mode = True  # True for training mode, False for prediction mode
                                # will stay in training mode until first prediction
        self.streams = {}

        self.sio = socketio.AsyncServer(async_mode='sanic')
        self.app = Sanic()
        self.sio.attach(self.app)

    def connect(self, ip, port):
        self.socket_client = SocketIO(ip, port)
        self.socket_client.connect()

    def disconnect(self):
        self.socket_client.disconnect()

    def create_streams(self):
        self.streams['eeg'] = self._create_eeg_stream()
        self.streams['marker'] = self._create_marker_stream()

        # TODO: data is only variable between training (ie. first time the app
        # is opened) and predictions. The contents of data need to be synced
        # with the front end and database, based on what the user wants.
        data = {'event_time': 0.4,      # or 0.2?
                'train': True,
                'train_epochs': 120}    # 120 for 2 min, 240 for 4 min

        self.streams['ml'] = self._create_ml_stream(data)

    def start_streams(self):
        for stream in ['eeg', 'marker', 'ml']:
            self._start_stream(stream)

    def start_loop_worker(self):
        """Continuously pulls data from ml_stream and sends to server based on
        whether we are training or predicting"""
        if self.streams.get('ml') is None:
            raise Exception(f"ml stream does not exist")

        while True:
            # send training jobs to server
            if self.train_mode:
                data = self.streams['ml'].get_training_data()
                if data is not None:
                    train_data, train_targets = data
                    self.train(uuid, train_data, train_targets)

            # send prediction jobs to server
            else:
                data = self.streams['ml'].get_prediction_data()
                if data is not None:
                    uuid = data['epoch_id']
                    eeg_data = data['eeg_data']
                    self.predict(uuid, eeg_data)

            sleep(0.1)


    # for testing
    def predict(self, uuid, eeg_data):
        data = (uuid, eeg_data)
        self.socket_client.emit("retrieve_prediction_results_test", data, self.on_retrieve_prediction_results)
        self.socket_client.wait_for_callbacks(seconds=1)

    def train(self, uuid, eeg_data, p300):
        data = (uuid, eeg_data, p300)
        self.socket_client.emit("train_classifier_test", data, self.on_train_results)
        self.socket_client.wait_for_callbacks(seconds=1)


    #
    # Private methods for creating and starting streams
    #

    def _create_eeg_stream(self):
        return EEGStream(thread_name='EEG_data', event_channel_name='P300')

    def _create_marker_stream(self):
        info = pylsl.StreamInfo('Markers', 'Markers', 5, 0, 'string', 'mywid32')
        self.marker_outlet = pylsl.StreamOutlet(info)

        return MarkerStream(thread_name='Marker_stream')

    def _create_ml_stream(self, data):
        if self.streams.get('eeg') is None:
            raise Exception(f"EEG stream does not exist")
        if self.streams.get('marker') is None:
            raise Exception(f"Marker stream does not exist")

        return MLStream(m_stream=self.streams['marker'],
                        eeg_stream=self.streams['eeg'],
                        event_time=data['event_time'],
                        train=data['train'],
                        train_epochs=data['train_epochs'])

    def _start_stream(self, stream):
        if self.streams.get(stream) is None:
            raise RuntimeError("Cannot start {0} stream, stream does not exist".format(stream))
        elif stream == 'ml':
            self.streams[stream].start()
        else:
            self.streams[stream].lsl_connect()
            while not self.streams[stream].data:
                time.sleep(0.1)

    #
    # Handlers for communication with front end
    #

    def initialize_handlers(self):
        self.sio.on("train", self.train_handler)
        self.sio.on("predict", self.predict_handler)

    async def train_handler(self, sid, args):
        uuid, timestamp, p300 = args
        package = [
            str(timestamp),
            "",             # event
            str(p300),      # target
            str(1),         # 1 event total
            str(uuid)       # take uuid for epoch id
        ]
        self.marker_outlet.push_sample(package)

    async def predict_handler(self, sid, args):
        self.train_mode = False
        uuid, timestamp = args
        package = [
            str(timestamp),
            "",             # event
            str(True),      # target
            str(1),         # 1 event total
            str(uuid)       # take uuid for epoch id
        ]
        self.marker_outlet.push_sample(package)



if __name__ == '__main__':
    p300_client = P300Client()
    p300_client.create_streams()
    p300_client.initialize_handlers()
    p300_client.app.run(host='localhost', port=8001)
