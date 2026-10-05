//
//  MorphletSquircleView.mm
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import "MorphletSquircleView.h"
#import "MorphletSpringSolver.h"
#import "MorphletSquirclePath.h"

static const CGFloat kKeyframesPerSecond = 60;

@implementation MorphletSquircleView {
  CAShapeLayer *_maskLayer;
  CGSize _pathSize;
  CGFloat _pathRadius;
  CGFloat _pathSmoothing;
  CGFloat _pathDisplayCurve;
  CGSize _animationFromSize;
  CGFloat _animationFromRadius;
  CGFloat _animationFromDisplayCurve;
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    _cornerRadius = 32;
    _cornerSmoothing = 0.6;
    _pathRadius = -1;
    self.clipsToBounds = YES;
    _maskLayer = [CAShapeLayer layer];
    _maskLayer.frame = CGRectMake(0, 0, 8192, 8192);
    self.layer.mask = _maskLayer;
  }
  return self;
}

- (void)setCornerRadius:(CGFloat)cornerRadius {
  _cornerRadius = cornerRadius;
  [self setNeedsLayout];
}

- (void)setCornerSmoothing:(CGFloat)cornerSmoothing {
  _cornerSmoothing = MAX(0, MIN(1, cornerSmoothing));
  [self setNeedsLayout];
}

- (void)setDisplayCurve:(CGFloat)displayCurve {
  _displayCurve = MAX(0, MIN(1, displayCurve));
  [self setNeedsLayout];
}

- (void)layoutSubviews {
  [super layoutSubviews];
  [self updateMask];
}

- (void)updateMask {
  CGSize size = self.bounds.size;
  if (CGSizeEqualToSize(size, _pathSize) && _cornerRadius == _pathRadius && _cornerSmoothing == _pathSmoothing &&
      _displayCurve == _pathDisplayCurve) {
    return;
  }

  CALayer *presentation = self.layer.presentationLayer;
  CGSize fromSize = presentation ? presentation.bounds.size : _pathSize;
  CGFloat fromRadius = _pathRadius < 0 ? _cornerRadius : _pathRadius;
  CGFloat fromDisplayCurve = _pathRadius < 0 ? _displayCurve : _pathDisplayCurve;

  CGFloat progress = [self pathAnimationProgressAtSize:fromSize];
  if (!isnan(progress)) {
    fromRadius = MAX(0, _animationFromRadius + (_pathRadius - _animationFromRadius) * progress);
    fromDisplayCurve = _animationFromDisplayCurve + (_pathDisplayCurve - _animationFromDisplayCurve) * progress;
  }

  _pathSize = size;
  _pathRadius = _cornerRadius;
  _pathSmoothing = _cornerSmoothing;
  _pathDisplayCurve = _displayCurve;

  CGPathRef path = MorphletSquirclePath(size, _cornerRadius, _cornerSmoothing, _displayCurve).CGPath;
  CAAnimation *pathAnimation = [self pathAnimationFromSize:fromSize radius:fromRadius displayCurve:fromDisplayCurve toPath:path];

  [CATransaction begin];
  [CATransaction setDisableActions:YES];
  if (pathAnimation) {
    _animationFromSize = fromSize;
    _animationFromRadius = fromRadius;
    _animationFromDisplayCurve = fromDisplayCurve;
    [_maskLayer addAnimation:pathAnimation forKey:@"path"];
  } else {
    [_maskLayer removeAnimationForKey:@"path"];
  }
  _maskLayer.path = path;
  [CATransaction commit];
}

- (nullable CAAnimation *)pathAnimationFromSize:(CGSize)fromSize
                                         radius:(CGFloat)fromRadius
                                   displayCurve:(CGFloat)fromDisplayCurve
                                         toPath:(CGPathRef)path {
  CABasicAnimation *sizeAnimation = [self boundsAnimation];
  if (!sizeAnimation) {
    return nil;
  }

  if ([sizeAnimation isKindOfClass:CASpringAnimation.class]) {
    return [self keyframesFollowingSpring:(CASpringAnimation *)sizeAnimation
                                 fromSize:fromSize
                                   radius:fromRadius
                             displayCurve:fromDisplayCurve];
  }

  CABasicAnimation *pathAnimation = [sizeAnimation copy];
  pathAnimation.keyPath = @"path";
  pathAnimation.additive = NO;
  CAShapeLayer *presentation = _maskLayer.presentationLayer;
  CGPathRef from = presentation.path ?: _maskLayer.path;
  pathAnimation.fromValue = (__bridge id)(from ?: path);
  pathAnimation.toValue = (__bridge id)path;
  pathAnimation.byValue = nil;
  return pathAnimation;
}

- (CAKeyframeAnimation *)keyframesFollowingSpring:(CASpringAnimation *)spring
                                         fromSize:(CGSize)fromSize
                                           radius:(CGFloat)fromRadius
                                     displayCurve:(CGFloat)fromDisplayCurve {
  CFTimeInterval duration = spring.duration > 0 ? spring.duration : spring.settlingDuration;
  NSInteger count = MAX(2, (NSInteger)ceil(duration * kKeyframesPerSecond)) + 1;
  NSMutableArray *values = [NSMutableArray arrayWithCapacity:count];
  NSMutableArray<NSNumber *> *keyTimes = [NSMutableArray arrayWithCapacity:count];

  for (NSInteger index = 0; index < count; index++) {
    CGFloat fraction = (CGFloat)index / (count - 1);
    CGFloat progress =
      MorphletSpringProgress(spring.mass, spring.stiffness, spring.damping, spring.initialVelocity, duration * fraction);
    CGSize size = CGSizeMake(fromSize.width + (_pathSize.width - fromSize.width) * progress,
                             fromSize.height + (_pathSize.height - fromSize.height) * progress);
    CGFloat radius = MAX(0, fromRadius + (_pathRadius - fromRadius) * progress);
    CGFloat displayCurve = fromDisplayCurve + (_pathDisplayCurve - fromDisplayCurve) * progress;
    [values addObject:(__bridge id)MorphletSquirclePath(size, radius, _cornerSmoothing, displayCurve).CGPath];
    [keyTimes addObject:@(fraction)];
  }

  CAKeyframeAnimation *animation = [CAKeyframeAnimation animationWithKeyPath:@"path"];
  animation.values = values;
  animation.keyTimes = keyTimes;
  animation.duration = duration;
  animation.beginTime = spring.beginTime;
  animation.fillMode = spring.fillMode;
  animation.calculationMode = kCAAnimationLinear;
  return animation;
}

- (CGFloat)pathAnimationProgressAtSize:(CGSize)size {
  if (![_maskLayer animationForKey:@"path"]) {
    return NAN;
  }
  CGFloat width = _pathSize.width - _animationFromSize.width;
  CGFloat height = _pathSize.height - _animationFromSize.height;
  if (MAX(fabs(width), fabs(height)) < 1) {
    return NAN;
  }
  return fabs(width) >= fabs(height) ? (size.width - _animationFromSize.width) / width
                                     : (size.height - _animationFromSize.height) / height;
}

- (nullable CABasicAnimation *)boundsAnimation {
  for (NSString *key in self.layer.animationKeys.reverseObjectEnumerator) {
    CAAnimation *animation = [self.layer animationForKey:key];
    if ([animation isKindOfClass:CABasicAnimation.class] &&
        [((CABasicAnimation *)animation).keyPath hasPrefix:@"bounds"]) {
      return (CABasicAnimation *)animation;
    }
  }
  return nil;
}

@end
