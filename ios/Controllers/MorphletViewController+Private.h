//
//  MorphletViewController+Private.h
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import "MorphletSquircleView.h"
#import "MorphletViewController.h"

NS_ASSUME_NONNULL_BEGIN

@interface MorphletViewController () <UIGestureRecognizerDelegate> {
 @package
  MorphletPresentationState _presentationState;
  CGFloat _keyboardHeight;

  UIView *_backdropView;
  MorphletSquircleView *_cardView;
  UIPanGestureRecognizer *_panGesture;
  UITapGestureRecognizer *_backdropTap;
  UIViewPropertyAnimator *_cardAnimator;
  CGSize _lastViewSize;

  CGFloat _dragOffset;
  CGFloat _lastTranslation;
  UIScrollView *_trackingScrollView;

  BOOL _isMorphing;
  UIView *_originSnapshot;
  UIColor *_originColor;
  CGFloat _originRadius;
  __weak UIView *_morphedOriginView;
  CGFloat _originAlpha;
  __weak UIWindow *_referenceWindow;
  UIView *_coverView;

  UIView *_stackView;
  NSInteger _stackDepth;
  BOOL _didPushStack;
}

- (void)applyCardGeometryAnimated:(BOOL)animated;
- (CGFloat)offscreenOffset;
- (void)setCardFrame:(CGRect)frame;
- (void)interruptCardAnimation;
- (void)finishPresentingIfNeeded;
- (void)dismissWithVelocity:(CGFloat)velocity interactive:(BOOL)interactive animated:(BOOL)animated;

@end

NS_ASSUME_NONNULL_END
