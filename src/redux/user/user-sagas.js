import { takeLatest, put, all, call } from 'redux-saga/effects';

import UserActionTypes from './user-types';

import { signInSuccess, signInFailure, signOutSuccess, signOutFailure, signUpSuccess, signUpFailure } from './user-actions';
import { restoreCart } from '../cart/cart-actions';

import { auth, googleProvider, facebookProvider, createUserProfileDocument, getCurrentUser } from '../../firebase/firebase.utils';

export function* getSnapshotFromUserAuth(userAuth, additionalData) {
  try {
    const userRef = yield call(createUserProfileDocument, userAuth, additionalData);
    const userSnapshot = yield userRef.get();
    yield put(signInSuccess({ id: userSnapshot.id, ...userSnapshot.data() }));
  } catch (error) {
    yield put(signInFailure(error));
  }
}

export function* signInWithGoogle() {
  try {
    const { user } = yield auth.signInWithPopup(googleProvider);
    yield getSnapshotFromUserAuth(user);
  } catch (error) {
    yield put(signInFailure(error));
  }
}

export function* signInWithFacebook() {
  try {
    const { user } = yield auth.signInWithPopup(facebookProvider);
    yield getSnapshotFromUserAuth(user);
  } catch (error) {
    yield put(signInFailure(error));
  }
}

export function* signInWithEmail({ payload: { email, password } }) {
  try {
    const { user } = yield auth.signInWithEmailAndPassword(email, password);
    yield getSnapshotFromUserAuth(user);
  } catch (error) {
    yield put(signInFailure(error));
  }
}

export function* isUserAuthenticated() {
  try {
    const userAuth = yield getCurrentUser();
    if (!userAuth) return;
    yield getSnapshotFromUserAuth(userAuth);
  } catch (error) {
    yield put(signInFailure(error));
  }
}

export function* signOut() {
  try {
    yield auth.signOut();
    yield put(signOutSuccess());
  } catch (error) {
    yield put(signOutFailure(error));
  }
}

export function* signUp({ payload: { email, password, displayName } }) {
  try {
    const { user } = yield auth.createUserWithEmailAndPassword(email, password);
    yield put(signUpSuccess({ user, additionalData: { displayName } }));
  } catch (error) {
    yield put(signUpFailure(error));
  }
}

export function* signInAfterSignUp({ payload: { user, additionalData } }) {
  yield getSnapshotFromUserAuth(user, additionalData);
}

export function* restoreCartAfterSignIn({ payload: { storedCart }}) {
  yield put(restoreCart(storedCart));
}

export function* onGoogleSignInStart() {
  yield takeLatest(UserActionTypes.GOOGLE_SIGN_IN_START, signInWithGoogle);
}

export function* onFacebookSignInStart() {
  yield takeLatest(UserActionTypes.FACEBOOK_SIGN_IN_START, signInWithFacebook);
}

export function* onEmailSignInStart() {
  yield takeLatest(UserActionTypes.EMAIL_SIGN_IN_START, signInWithEmail);
}

export function* onCheckUserSession() {
  yield takeLatest(UserActionTypes.CHECK_USER_SESSION, isUserAuthenticated);
}

export function* onSignOutStart() {
  yield takeLatest(UserActionTypes.SIGN_OUT_START, signOut);
}

export function* onSignUpStart() {
  yield takeLatest(UserActionTypes.SIGN_UP_START, signUp);
}

export function* onSignUpSuccess() {
  yield takeLatest(UserActionTypes.SIGN_UP_SUCCESS, signInAfterSignUp);
}

export function* onSignInSuccess() {
  yield takeLatest(UserActionTypes.SIGN_IN_SUCCESS, restoreCartAfterSignIn);
}

export function* userSagas() {
  yield all([
    call(onGoogleSignInStart),
    call(onFacebookSignInStart),
    call(onEmailSignInStart),
    call(onCheckUserSession),
    call(onSignOutStart),
    call(onSignUpStart),
    call(onSignUpSuccess),
    call(onSignInSuccess)
  ]);
}