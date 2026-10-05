//
//  MorphletViewController+Gestures.mm
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import "MorphletSpring.h"
#import "MorphletViewController+Gestures.h"
#import "MorphletViewController+Private.h"

static const CGFloat kDismissThreshold = 120;
static const CGFloat kFadeDistance = kDismissThreshold * 2.5;
static const CGFloat kDismissVelocity = 1000;

static CGFloat MorphletRubberBand(CGFloat offset, CGFloat dimension) {
  return (1.0 - (1.0 / ((offset * 0.55 / dimension) + 1.0))) * dimension;
}

@implementation MorphletViewController (Gestures)

- (BOOL)gestureRecognizerShouldBegin:(UIGestureRecognizer *)gestureRecognizer {
  if (gestureRecognizer == _panGesture) {
    if (!self.draggable || _isMorphing ||
        (_presentationState != MorphletPresentationStatePresented &&
         _presentationState != MorphletPresentationStatePresenting)) {
      return NO;
    }
    CGPoint velocity = [_panGesture velocityInView:self.view];
    return fabs(velocity.y) > fabs(velocity.x);
  }

  if (gestureRecognizer == _backdropTap) {
    return self.dismissible && _presentationState != MorphletPresentationStateDismissing;
  }

  return YES;
}

- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer
  shouldRecognizeSimultaneouslyWithGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer {
  if (gestureRecognizer != _panGesture) {
    return NO;
  }

  UIView *view = otherGestureRecognizer.view;
  return [view isKindOfClass:UIScrollView.class] &&
         otherGestureRecognizer == ((UIScrollView *)view).panGestureRecognizer && [view isDescendantOfView:_cardView];
}

- (void)handleBackdropTap:(UITapGestureRecognizer *)tap {
  if (tap.state == UIGestureRecognizerStateEnded && self.dismissible) {
    [self dismissWithVelocity:0 interactive:YES animated:YES];
  }
}

- (void)handlePan:(UIPanGestureRecognizer *)pan {
  CGFloat translation = [pan translationInView:self.view].y;

  switch (pan.state) {
    case UIGestureRecognizerStateBegan: {
      [self interruptCardAnimation];
      [self finishPresentingIfNeeded];
      _dragOffset = _cardView.transform.ty;
      _lastTranslation = translation;
      _trackingScrollView = _dragOffset == 0 ? [self scrollViewAtPoint:[pan locationInView:_cardView]] : nil;
      break;
    }

    case UIGestureRecognizerStateChanged: {
      CGFloat delta = translation - _lastTranslation;
      _lastTranslation = translation;

      UIScrollView *scrollView = _trackingScrollView;
      if (!scrollView) {
        _dragOffset += delta;
        [self applyDragOffset];
        break;
      }

      CGFloat top = -scrollView.adjustedContentInset.top;
      BOOL atTop = scrollView.contentOffset.y <= top + 0.5;
      if (atTop && delta > 0) {
        [self takeOverFromScrollView:scrollView];
        _dragOffset += delta;
        [self applyDragOffset];
      }
      break;
    }

    case UIGestureRecognizerStateEnded:
    case UIGestureRecognizerStateCancelled:
    case UIGestureRecognizerStateFailed: {
      _trackingScrollView = nil;
      if (_dragOffset == 0 || _presentationState != MorphletPresentationStatePresented) {
        break;
      }

      CGFloat velocity = [pan velocityInView:self.view].y;
      CGFloat offset = [self displayOffset];
      BOOL ended = pan.state == UIGestureRecognizerStateEnded;
      BOOL shouldDismiss = self.dismissible && ended && offset > 0 &&
                           ((offset > kDismissThreshold && velocity > -300) || velocity > kDismissVelocity);

      if (shouldDismiss) {
        [self dismissWithVelocity:MAX(0, velocity) interactive:YES animated:YES];
      } else {
        [self snapBackWithVelocity:ended ? velocity : 0];
      }
      break;
    }

    default:
      break;
  }
}

- (void)takeOverFromScrollView:(UIScrollView *)scrollView {
  _trackingScrollView = nil;

  UIPanGestureRecognizer *scrollPan = scrollView.panGestureRecognizer;
  scrollPan.enabled = NO;
  scrollPan.enabled = YES;

  CGPoint top = CGPointMake(scrollView.contentOffset.x, -scrollView.adjustedContentInset.top);
  [scrollView setContentOffset:top animated:NO];
}

- (nullable UIScrollView *)scrollViewAtPoint:(CGPoint)point {
  UIView *view = [_cardView hitTest:point withEvent:nil];

  while (view && view != _cardView) {
    if ([view isKindOfClass:UIScrollView.class]) {
      UIScrollView *scrollView = (UIScrollView *)view;
      UIEdgeInsets inset = scrollView.adjustedContentInset;
      CGFloat scrollableHeight = scrollView.contentSize.height + inset.top + inset.bottom;
      if (scrollView.isScrollEnabled && scrollableHeight > scrollView.bounds.size.height + 0.5) {
        return scrollView;
      }
    }
    view = view.superview;
  }

  return nil;
}

- (CGFloat)displayOffset {
  if (_dragOffset < 0) {
    return -MorphletRubberBand(-_dragOffset, 60);
  }
  if (!self.dismissible) {
    return MorphletRubberBand(_dragOffset, 180);
  }
  return _dragOffset;
}

- (void)applyDragOffset {
  CGFloat offset = [self displayOffset];
  CGFloat down = MAX(0, offset);

  _cardView.transform = CGAffineTransformMakeTranslation(0, offset);
  _cardView.alpha = self.dismissible && self.fadesOnDrag ? MAX(0, 1 - down / kFadeDistance) : 1;

  CGFloat progress = MIN(1, down / MAX(1, [self offscreenOffset]));
  _backdropView.alpha = self.backdropOpacity * (1 - progress);
}

- (void)snapBackWithVelocity:(CGFloat)velocity {
  CGFloat current = [self displayOffset];
  _dragOffset = 0;

  CGFloat relativeVelocity = fabs(current) > 1 ? -velocity / current : 0;

  __weak __typeof(self) weakSelf = self;
  _cardAnimator = [MorphletSpring animateWithSpring:self.snapSpring
    velocity:relativeVelocity
    animations:^{
      __typeof(self) strongSelf = weakSelf;
      if (!strongSelf) {
        return;
      }
      strongSelf->_cardView.transform = CGAffineTransformIdentity;
      strongSelf->_cardView.alpha = 1;
      strongSelf->_backdropView.alpha = strongSelf.backdropOpacity;
    }
    completion:^(BOOL finished) {
      __typeof(self) strongSelf = weakSelf;
      if (strongSelf && finished) {
        strongSelf->_cardAnimator = nil;
      }
    }];
}

@end
