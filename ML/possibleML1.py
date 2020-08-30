import librosa 
import librosa.display
import numpy as np
import pandas as pd
import random
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, Activation, Flatten, MaxPooling2D, Conv2D
import pickle, os

#>Goal, train on UrbanSounds & annotated SONYC data, then we show that we could predict which sounds to decrease the volume of (take out of someone's hearing), and which one needs their attention

#YouTube Channel: CodeEmporium

data = pd.read_csv('UrbanSound8K/metadata/UrbanSound8K.csv')
valid_data = data[['slice_file_name', 'fold' ,'classID', 'class']][ data['end']-data['start'] >= 3 ]
valid_data['path'] = 'fold' + valid_data['fold'].astype('str') + '/' + valid_data['slice_file_name'].astype('str')
D = [] # Dataset

# print("beginning for loop")
# for row in valid_data.itertuples():
#     y, sr = librosa.load('./UrbanSound8K/audio/' + row.path, duration=2.97)
#     ps = librosa.feature.melspectrogram(y=y, sr=sr)
#     if ps.shape != (128, 128): continue
#     D.append( (ps, row.classID) )
# print("ended for loop")
# dataset = D
# random.shuffle(dataset)

# with open("librosa-loop.pkl", "wb") as lbl:
#     pickle.dump(dataset, lbl)

with open("librosa-loop.pkl", "rb") as lbl:
    dataset = pickle.load(file=lbl)



train = dataset[:7000]
test = dataset[7000:]

X_train, y_train = zip(*train)
X_test, y_test = zip(*test)

# Reshape for CNN input
X_train = np.array([x.reshape( (128, 128, 1) ) for x in X_train])
X_test = np.array([x.reshape( (128, 128, 1) ) for x in X_test])

# One-Hot encoding for classes
y_train = np.array(tf.keras.utils.to_categorical(y_train, 10))
y_test = np.array(tf.keras.utils.to_categorical(y_test, 10))

model = Sequential()
input_shape=(128, 128, 1)

model.add(Conv2D(24, (5, 5), strides=(1, 1), input_shape=input_shape))
model.add(MaxPooling2D((4, 2), strides=(4, 2)))
model.add(Activation('relu'))

model.add(Conv2D(48, (5, 5), padding="valid"))
model.add(MaxPooling2D((4, 2), strides=(4, 2)))
model.add(Activation('relu'))

model.add(Conv2D(48, (5, 5), padding="valid"))
model.add(Activation('relu'))

model.add(Flatten())
model.add(Dropout(rate=0.5))

model.add(Dense(64))
model.add(Activation('relu'))
model.add(Dropout(rate=0.5))

model.add(Dense(10))
model.add(Activation('softmax'))

model.compile(
	optimizer="Adam",
	loss="categorical_crossentropy",
	metrics=['accuracy'])

model.fit(
	x=X_train,
	y=y_train,
    epochs=1,
    batch_size=128,
    validation_data= (X_test, y_test))

score = model.evaluate(
	x=X_test,
	y=y_test)


print('Test loss:', score[0])
print('Test accuracy:', score[1])


rate = 1.07 # replace with 0.81 and execute again

for row in valid_data.itertuples():
    try:
        os.makedirs('./augmented/fold' + str(row.fold) + '/speed_' + str(int(rate*100)) + '/')
    except:
        pass
    y, sr = librosa.load('./UrbanSound8K/audio/' + row.path)  
    y_changed = librosa.effects.time_stretch(y, rate=rate)
    librosa.output.write_wav('./augmented/fold' + str(row.fold) + '/speed_' + str(int(rate*100)) + '/' + row.slice_file_name ,y_changed, sr)
    
print("Done with 1.07")
rate = 0.81
for row in valid_data.itertuples():
    try:
        os.makedirs('./augmented/fold' + str(row.fold) + '/speed_' + str(int(rate*100)) + '/')
    except:
        pass
    y, sr = librosa.load('./UrbanSound8K/audio/' + row.path)  
    y_changed = librosa.effects.time_stretch(y, rate=rate)
    librosa.output.write_wav('./augmented/fold' + str(row.fold) + '/speed_' + str(int(rate*100)) + '/' + row.slice_file_name ,y_changed, sr)
print("Done with .81")


n_steps = 2 #-1, -2, 2, 1

for row in valid_data.itertuples():
    try:
        os.makedirs('./augmented/fold' + str(row.fold) + '/ps1_' + str(int(n_steps)) + '/')
    except:
        pass
    y, sr = librosa.load('./UrbanSound8K/audio/' + row.path)  
    y_changed = librosa.effects.pitch_shift(y, sr, n_steps=n_steps)
    librosa.output.write_wav('./augmented/fold' + str(row.fold) + '/ps1_' + str(int(n_steps)) + '/' + row.slice_file_name ,y_changed, sr)
print("done with n_steps")

n_steps = 2.5 #-2.5, -3.5, 2.5, 3.5

for row in valid_data.itertuples():
    try:
        os.makedirs('./augmented/fold' + str(row.fold) + '/ps2_m' + str(int(n_steps*10)) + '/')
    except:
        pass
    y, sr = librosa.load('/UrbanSound8K/audio/' + row.path)  
    y_changed = librosa.effects.pitch_shift(y, sr, n_steps=n_steps)
    librosa.output.write_wav('./augmented/fold' + str(row.fold) + '/ps2_m' + str(int(n_steps*10)) + '/' + row.slice_file_name ,y_changed, sr)
print("Done with 2.5")
print(len(D))

dataset = D
random.shuffle(dataset)

train = dataset[:35000]
test = dataset[35000:]

X_train, y_train = zip(*train)
X_test, y_test = zip(*test)

X_train = np.array([x.reshape( (128, 128, 1) ) for x in X_train])
X_test = np.array([x.reshape( (128, 128, 1) ) for x in X_test])

y_train = np.array(keras.utils.to_categorical(y_train, 10))
y_test = np.array(keras.utils.to_categorical(y_test, 10))

model = Sequential()
input_shape=(128, 128, 1)

model.add(Conv2D(24, (5, 5), strides=(1, 1), input_shape=input_shape))
model.add(MaxPooling2D((4, 2), strides=(4, 2)))
model.add(Activation('relu'))

model.add(Conv2D(48, (5, 5), padding="valid"))
model.add(MaxPooling2D((4, 2), strides=(4, 2)))
model.add(Activation('relu'))

model.add(Conv2D(48, (5, 5), padding="valid"))
model.add(Activation('relu'))

model.add(Flatten())
model.add(Dropout(rate=0.5))

model.add(Dense(64))
model.add(Activation('relu'))
model.add(Dropout(rate=0.5))

model.add(Dense(10))
model.add(Activation('softmax'))

model.compile(
	optimizer="Adam",
	loss="categorical_crossentropy",
	metrics=['accuracy'])

model.fit(
	x=X_train, 
	y=y_train,
    epochs=24,
    batch_size=128,
    validation_data= (X_test, y_test))

score = model.evaluate(
	x=X_test,
	y=y_test)

print('Test loss:', score[0])
print('Test accuracy:', score[1])

model.save_weights(
    "./model", overwrite=True, save_format=None, options=None
)
