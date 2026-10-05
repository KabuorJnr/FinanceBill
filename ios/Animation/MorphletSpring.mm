//
//  MorphletSpring.mm
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import "MorphletSpring.h"

@implementation MorphletSpring

+ (UIViewPropertyAnimator *)animatorWithSpring:(MorphletSpringConfig *)spring velocity:(CGFloat)velocity {
  UISpringTimingParameters *parameters =
    [[UISpringTimingParameters alloc] initWithMass:spring.mass
                                         stiffness:spring.stiffness
                                           damping:spring.damping
                                   initialVelocity:CGVectorMake(velocity, velocity)];
  UIViewPropertyAnimator *animator = [[UIViewPropertyAnimator alloc] initWithDuration:0.5 timingParameters:parameters];
  animator.interruptible = YES;
  return animator;
}

+ (UIViewPropertyAnimator *)animateWithSpring:(MorphletSpringConfig *)spring
                                     velocity:(CGFloat)velocity
                                   animations:(void (^)(void))animations
                                   completion:(nullable void (^)(BOOL finished))completion {
  UIViewPropertyAnimator *animator = [self animatorWithSpring:spring velocity:velocity];
  [animator addAnimations:animations];
  if (completion) {
    [animator addCompletion:^(UIViewAnimatingPosition position) {
      completion(position == UIViewAnimatingPositionEnd);
    }];
  }
  [animator startAnimation];
  return animator;
}

@end
