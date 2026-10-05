//
//  MorphletContainerView.h
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import <React/RCTMountingTransactionObserving.h>
#import <React/RCTViewComponentView.h>
#import <UIKit/UIKit.h>
#import "MorphletContainerViewDelegate.h"

NS_ASSUME_NONNULL_BEGIN

@interface MorphletContainerView : RCTViewComponentView <RCTMountingTransactionObserving>

@property (nonatomic, weak, nullable) id<MorphletContainerViewDelegate> delegate;

@end

NS_ASSUME_NONNULL_END
