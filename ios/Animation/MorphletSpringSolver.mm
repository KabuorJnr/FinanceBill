//
//  MorphletSpringSolver.mm
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import "MorphletSpringSolver.h"

static const CGFloat kCriticalDampingTolerance = 1e-4;

CGFloat MorphletSpringProgress(CGFloat mass, CGFloat stiffness, CGFloat damping, CGFloat initialVelocity, CGFloat time) {
  CGFloat naturalFrequency = sqrt(stiffness / mass);
  CGFloat dampingRatio = damping / (2 * sqrt(stiffness * mass));
  CGFloat startOffset = -1;
  CGFloat offset;

  if (fabs(dampingRatio - 1) < kCriticalDampingTolerance) {
    offset = exp(-naturalFrequency * time) *
             (startOffset + (initialVelocity + naturalFrequency * startOffset) * time);
  } else if (dampingRatio < 1) {
    CGFloat dampedFrequency = naturalFrequency * sqrt(1 - dampingRatio * dampingRatio);
    CGFloat decay = dampingRatio * naturalFrequency;
    offset = exp(-decay * time) * (startOffset * cos(dampedFrequency * time) +
                                   (initialVelocity + decay * startOffset) / dampedFrequency * sin(dampedFrequency * time));
  } else {
    CGFloat spread = naturalFrequency * sqrt(dampingRatio * dampingRatio - 1);
    CGFloat fastRoot = -dampingRatio * naturalFrequency - spread;
    CGFloat slowRoot = -dampingRatio * naturalFrequency + spread;
    CGFloat fastWeight = (initialVelocity - slowRoot * startOffset) / (fastRoot - slowRoot);
    CGFloat slowWeight = startOffset - fastWeight;
    offset = slowWeight * exp(slowRoot * time) + fastWeight * exp(fastRoot * time);
  }

  return 1 + offset;
}
