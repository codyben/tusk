import librosa 
import librosa.display
import numpy as np
import pandas as pd
import random
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, Activation, Flatten, MaxPooling2D, Conv2D
import pickle, os
from tensorflow import keras
from tensorflow.keras.models import load_model

#>Goal, train on UrbanSounds & annotated SONYC data, then we show that we could predict which sounds to decrease the volume of (take out of someone's hearing), and which one needs their attention

#YouTube Channel: CodeEmporium

# data = pd.read_csv('UrbanSound8K/metadata/UrbanSound8K.csv')
# valid_data = data[['slice_file_name', 'fold' ,'classID', 'class']][ data['end']-data['start'] >= 3 ]
# valid_data['path'] = 'fold' + valid_data['fold'].astype('str') + '/' + valid_data['slice_file_name'].astype('str')
D = [] # Dataset

valid_data = ["01_000341.wav","01_001086.wav"]
valid_data = [valid_data[0]]
print("beginning for loop")
for row in valid_data:
    y, sr = librosa.load(row, duration=2.97)
    ps = librosa.feature.melspectrogram(y=y, sr=sr)
    if ps.shape != (128, 128): continue
    D.append( (ps, 1) )
print("ended for loop")
dataset = D
random.shuffle(dataset)
X_test, y_test = zip(*dataset)
X_train = np.array([x.reshape( (128, 128, 1) ) for x in X_test])
y_test = np.array(tf.keras.utils.to_categorical(y_test, 0))
print(X_train[0].shape)
# with open("librosa-loop.pkl", "wb") as lbl:
#     pickle.dump(dataset, lbl)
# X_test = np.expand_dims(X_test, axis=0)
# X_test = np.expand_dims(X_test, axis=0)
# with open("librosa-loop.pkl", "rb") as lbl:
#     dataset = pickle.load(file=lbl)

classes = ["AC", "Car Horn", "Children", "Dog Barking", "Drilling", "Engine", "GUn", "Jackhammer", "Siren", "Street Music"]
model = load_model('new_model')

score = model.predict_proba(X_train)
for s_, f  in zip(score, valid_data):
    print()
    print("Prediction for {}".format(f))
    for s, c in zip(s_, classes):
        print("\t{}: {}".format(c, str(s)))

# print(preds)
